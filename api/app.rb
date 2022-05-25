# frozen_string_literal: true

#==============================================================================
# Copyright (C) 2021-present Alces Flight Ltd.
#
# This file is part of Flight File Manager.
#
# This program and the accompanying materials are made available under
# the terms of the Eclipse Public License 2.0 which is available at
# <https://www.eclipse.org/legal/epl-2.0>, or alternative license
# terms made available by Alces Flight Ltd - please direct inquiries
# about licensing to licensing@alces-flight.com.
#
# Flight File Manager is distributed in the hope that it will be useful, but
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR
# IMPLIED INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS
# OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY OR FITNESS FOR A
# PARTICULAR PURPOSE. See the Eclipse Public License 2.0 for more
# details.
#
# You should have received a copy of the Eclipse Public License 2.0
# along with Flight File Manager. If not, see:
#
#  https://opensource.org/licenses/EPL-2.0
#
# For more information on Flight File Manager, please visit:
# https://github.com/openflighthpc/flight-file-manager
#===============================================================================

require 'sinatra/base'
require 'securerandom'
require_relative 'app/errors'
require 'pathname'

class App < Sinatra::Base
  configure do
    set :raise_errors, true
    set :show_exceptions, false
  end

  not_found do
    { errors: ['Not Found'] }.to_json
  end

  # Converts HttpError objects into their JSON representation. Each object already
  # sets the response code
  error(HttpError) do
    e = env['sinatra.error']
    level = (e.is_a?(UnexpectedError) ? :error : :debug)
    LOGGER.send level, e.full_message
    status e.http_status
    if e.http_status == 401
      response["WWW-Authenticate"] = 'Basic realm="Flight File Manager"'
    end
    { errors: [e] }.to_json
  end

  # Catches all other errors and returns a generic Internal Server Error
  error(StandardError) do
    LOGGER.error env['sinatra.error'].full_message
    status 500
    { errors: ['An unexpected error has occurred!'] }.to_json
  end

  # Sets the response headers
  before do
    content_type 'application/json'
  end

  helpers do
    attr_accessor :current_user

    def current_cloudcmd
      @current_cloudcmd ||= CloudCmd.instances[current_user] || CloudCmd.new(current_user)
    end

    def dir_and_file(cloudcmd)
      if params["dir"].present?
        path = Pathname.new(params["dir"]).expand_path(cloudcmd.default_dir)
        begin
          path.realpath
        rescue Errno::ENOENT
          nil
        else
          path.directory? ? [path, nil] : [path.dirname, path.basename]
        end
      else
        [ nil, nil ]
      end
    end

    def build_payload(current_user, cloudcmd)
      mount_point = Flight.config.mount_point
      url_path = File.join(mount_point, 'backend', current_user)
      port = request.env['HTTP_X_REAL_PORT']
      port = request.port if port.nil? || port == ""
      dir, file = dir_and_file(cloudcmd)
      {
        dir: dir || cloudcmd.default_dir,
        file: file,
        home_dir: cloudcmd.default_dir,
        url: "//#{request.host}:#{port}#{url_path}"
      }.to_json
    end

    def set_cloudcmd_cookie(current_user, password)
      credentials = Base64.encode64("#{current_user}:#{password}")

      response.set_cookie(
        Flight.config.cloudcmd_cookie_name,
        domain: Flight.config.cloudcmd_cookie_domain,
        http_only: true,
        path: Flight.config.cloudcmd_cookie_path,
        same_site: :strict,
        secure: request.scheme == 'https',
        value: credentials,
      )
    end

    def delete_cloudcmd_cache
      CloudCmd.instances.delete(current_user)
      response.delete_cookie(
        Flight.config.cloudcmd_cookie_name,
        domain: Flight.config.cloudcmd_cookie_domain,
        http_only: true,
        path: Flight.config.cloudcmd_cookie_path,
        same_site: :strict,
        secure: request.scheme == 'https',
      )
    end
  end

  # Validates the user's credentials from the authorization header
  before do
    next if env['REQUEST_METHOD'] == 'OPTIONS'
    auth = Flight.config.auth_decoder.decode(
      request.cookies[Flight.config.sso_cookie_name],
      env['HTTP_AUTHORIZATION']
    )
    raise Unauthorized unless auth.valid?
    username = auth.username
    raise RootForbidden if username == 'root'
    self.current_user = username
  end

  get '/ping' do
    status 200
    { status: 'OK' }.to_json
  end

  post '/cloudcmd' do
    # Attempt to fetch the existing session
    cloudcmd = current_cloudcmd

    if cloudcmd.broken?
      # XXX Kill and launch perhaps?
      Flight.logger.error(
        "Running cloudcmd server for '#{current_user}' is missing port file. pid=#{cloudcmd.pid}"
      )
      status 500
      delete_cloudcmd_cache
      halt({
        errors: ["An unexpected error has occurred!"]
      }.to_json)
    elsif cloudcmd.running?
      Flight.logger.info(
        "Found running cloudcmd server for '#{current_user}' pid=#{cloudcmd.pid} port=#{cloudcmd.port}"
      )
      status 200
      set_cloudcmd_cookie(current_user, cloudcmd.password)
      halt build_payload(current_user, cloudcmd)
    end

    # Start the process
    cloudcmd.run

    if cloudcmd.running?
      # Cache the cloudcmd session
      CloudCmd.instances[current_user] ||= cloudcmd
    else
      # Error due to an error
      status 500
      halt({
        errors: ['Failed to create cloudcmd process']
      }.to_json)
    end

    status 201
    set_cloudcmd_cookie(current_user, cloudcmd.password)
    build_payload(current_user, cloudcmd)
  end

  delete '/cloudcmd' do
    cloudcmd = current_cloudcmd
    if !cloudcmd.running?
      status 204
      halt
    end
    cloudcmd.kill
    delete_cloudcmd_cache
    if !cloudcmd.running?
      Flight.logger.info "Cloudcmd server for '#{current_user}' has shutdown successfully"
      status 204
    else
      Flight.logger.info "Cloudcmd server for '#{current_user}' should shutdown"
      status 202
    end
  end
end
