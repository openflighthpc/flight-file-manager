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
  { errors: ['Not Found'] }.to_json
end

# Converts HttpError objects into their JSON representation. Each object already
# sets the response code
error(HttpError) do
  e = env['sinatra.error']
  level = (e.is_a?(UnexpectedError) ? :error : :debug)
  LOGGER.send level, e.full_message
  status e.http_status
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

post '/cloudcmds' do
  config_path = File.join(FlightFileManager.config.cache_dir, current_user, 'cloudcmd.json')
  if File.exists? config_path
    # TODO: Ensure the cloudcmd process is still running!
    # If not, continue with the create request
    # XXX: Should the password be reissued to authenticated uses? Or should they be forced
    # to recreate the session
    payload = JSON.load(File.read(config_path))
                  .slice('username', 'password', 'port')
                  .merge(errors: ['A cloudcmd session already exists!'])
                  .to_json
    status 409
    halt payload
  end

  passwd = Etc.getpwnam(current_user)
  payload = {
    username: current_user,
    password: SecureRandom.alphanumeric(20),
    port: 8080, # Make me dynamic/ configurable
  }
  config = {
    prefix: 'files',
    root: passwd.dir,
    oneFilePanel: true,
    keysPanel: false,
    console: false,
    terminal: false,
    configDialog: false,
    contact: false,
    **payload
  }

  # TODO: Handle existing "sessions"
  FileUtils.mkdir_p File.dirname(config_path)
  File.write(config_path, config.to_json)

  # Generate the command
  cmd = FlightFileManager.config
                         .cloudcmd_command
                         .gsub('$config_path', config_path)
  FlightFileManager.logger.info("Executing Command: #{cmd}")

  # XXX: Stash the PID and use it for persistent sessions
  Kernel.fork do
    # XXX: Should SIGTERM be trapped here?
    # What should happen to the child processes when the server exists?
    # XXX: Remove the config file path on exit

    # Become the session leader as the correct user
    Process::Sys.setgid(passwd.gid)
    Process::Sys.setuid(passwd.uid)
    Process.setsid

    # Exec into the cloud command
    # XXX: Where should this log?
    Kernel.exec({},
                *cmd.split(' '),
                unsetenv_others: true,
                close_others: true,
                chdir: passwd.dir,
                [:out, :err] => '/dev/null')
  end

  # Return the payload
  status 201
  payload.to_json
end

