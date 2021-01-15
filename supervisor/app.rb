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

require 'securerandom'
require_relative 'app/errors'

configure do
  set :raise_errors, true
  set :show_exceptions, false
end

not_found do
  { errors: [NotFound.new] }.to_json
end

# Converts HttpError objects into their JSON representation. Each object already
# sets the response code
error(HttpError) do
  e = env['sinatra.error']
  level = (e.is_a?(UnexpectedError) ? :error : :debug)
  LOGGER.send level, e.full_message
  { errors: [e] }.to_json
end

# Catches all other errors and returns a generic Internal Server Error
error(StandardError) do
  LOGGER.error env['sinatra.error'].full_message
  { errors: [UnexpectedError.new] }.to_json
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

# Checks the request Content-Type is application/json where appropriate
# Saves the input JSON as if it was a form input
#
# Adapted from:
# https://raw.githubusercontent.com/rack/rack-contrib/master/lib/rack/contrib/post_body_content_type_parser.rb
# The MIT License (MIT)
# Copyright (c) 2008 The Committers
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to
# deal in the Software without restriction, including without limitation the
# rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
# sell copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
# IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
before do
  next if ['GET', 'HEAD', 'OPTIONS'].include? env['REQUEST_METHOD']
  if env['CONTENT_TYPE'] == 'application/json'
    begin
      io = env['rack.input']
      body = io.read
      io.rewind
      json = body.empty? ? {} : JSON.parse(body, create_additions: false)
      raise BadRequest.new(detail: 'the body must be a JSON hash') unless json.is_a?(Hash)
      json.each { |k, v| params[k] ||= v }
    rescue JSON::ParserError
      raise BadRequest.new(detail: 'failed to parse body as JSON')
    end
  else
    raise UnsupportedMediaType
  end
end

get '/ping' do
  status 200
  { status: 'OK' }.to_json
end

post '/cloudcmd' do
  payload = {
    port: 8080, # Make me dynamic/ configurable
    password: SecureRandom.alphanumeric(20)
  }
  config = {
    username: current_user,
    prefix: 'files',
    root: '/', # Make me the user's home directory
    oneFilePanel: true,
    keysPanel: false,
    console: false,
    terminal: false,
    configDialog: false,
    contact: false,
    **payload
  }

  # TODO: Handle existing "sessions"
  config_path = File.join(FlightFileManager.config.cache_dir, current_user, 'cloudcmd.json')
  FileUtils.mkdir_p File.dirname(config_path)
  File.write(config_path, config.to_json)

  # TODO: Create the cloudcmd session

  # Return the payload
  payload.to_json
end

