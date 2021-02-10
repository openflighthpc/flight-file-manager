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

  class PamAuth
    def self.valid?(username, password)
      Rpam.auth(username, password, service: FlightFileManager.config.pam_service)
    end
  end

  helpers do
    attr_accessor :current_user

    def url_from_port(current_user, port)
      # Return a protocol relative URL to the backend server.
      mount_point = FlightFileManager.config.mount_point
      "//#{request.host}:#{request.port}#{mount_point}/backend/#{current_user}"
    end

    def build_payload(current_user, password, port)
      {
        password: password,
        url: url_from_port(current_user, port),
      }.to_json
    end
  end

  # Validates the user's credentials from the authorization header
  before do
    next if env['REQUEST_METHOD'] == 'OPTIONS'
    parts = (env['HTTP_AUTHORIZATION'] || '').chomp.split(' ')
    raise Unauthorized unless parts.length == 2 && parts.first == 'Basic'
    username, password = Base64.decode64(parts.last).split(':', 2)
    raise RootForbidden if username == 'root'
    raise Unauthorized unless username && password
    raise Unauthorized unless PamAuth.valid?(username, password)
    self.current_user = username
  end

  get '/ping' do
    status 200
    { status: 'OK' }.to_json
  end

  post '/cloudcmd' do
    cloudcmd = CloudCmd.new(current_user, env['HTTP_AUTHORIZATION'])
    if cloudcmd.broken?
      # XXX Kill and launch perhaps?
      FlightFileManager.logger.error(
        "Running cloudcmd server for '#{current_user}' is missing port file. pid=#{cloudcmd.pid}"
      )
      status 500
      halt({
        errors: ["An unexpected error has occurred!"]
      }.to_json)
    elsif cloudcmd.running?
      FlightFileManager.logger.info(
        "Found running cloudcmd server for '#{current_user}' pid=#{cloudcmd.pid} port=#{cloudcmd.port}"
      )
      status 200
      halt build_payload(current_user, cloudcmd.password, cloudcmd.port)
    end

    cloudcmd.run
    begin
      Process.detach(cloudcmd.pid)
    rescue Errno::ESRCH
      status 500
      halt({
        errors: ['Failed to create cloudcmd process']
      })
    end

    status 201
    build_payload(current_user, cloudcmd.password, cloudcmd.port)
  end

  delete '/cloudcmd' do
    cloudcmd = CloudCmd.new(current_user, env['HTTP_AUTHORIZATION'])
    if !cloudcmd.running?
      status 204
      halt
    end
    cloudcmd.kill
    if !cloudcmd.running?
      FlightFileManager.logger.info "Cloudcmd server for '#{current_user}' has shutdown successfully"
      status 204
    else
      FlightFileManager.logger.info "Cloudcmd server for '#{current_user}' should shutdown"
      status 202
    end
  end
end
