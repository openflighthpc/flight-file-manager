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

  def pid_path
    File.join(FlightFileManager.config.cache_dir, current_user, 'cloudcmd.pid')
  end

  def config_path
    File.join(FlightFileManager.config.cache_dir, current_user, 'cloudcmd.json')
  end

  def read_pid
    if File.exists?(pid_path)
      pid = File.read(pid_path).to_i
      if pid > 1
        pid
      else
        # Do not allow PID 0 or 1 to be returned! This is to prevent file read
        # issues feeding into the kill command
        status 500
        { error: ['An unexpected error has occurred!'] }
      end
    else
      nil
    end
  end

  # XXX: Consider extracting into a CloudCmd object
  def running?
    if pid = read_pid
      begin
        Process.getpgid(pid)
        true
      rescue Errno::ESRCH
        return false
      end
    else
      false
    end
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
  config_path = File.join(FlightFileManager.config.cache_dir, current_user, 'cloudcmd.json')
  port_path = File.join(FlightFileManager.config.cache_dir, current_user, 'cloudcmd.port')
  if running?
    if File.exists?(port_path)
      # XXX: Should the password be reissued to authenticated uses? Or should they be forced
      # to recreate the session
      payload = JSON.load(File.read(config_path))
                    .slice('username', 'password')
                    .merge(
                      errors: ['A cloudcmd session already exists!'],
                      port: File.read(port_path)
                    )
                    .to_json
      status 409
      halt payload
    else
      status 500
      FlightFileManager.logger.error <<~ERROR.chomp
        The cloudcmd session for '#{current_user}' is missing its port! (PID: #{read_pid})
      ERROR
      halt({
        errors: ["An unexpected error has occurred!"]
      }.to_json)
    end
  end

  passwd = Etc.getpwnam(current_user)
  payload = {
    username: current_user,
    password: SecureRandom.alphanumeric(20)
  }
  config = {
    prefix: '/files',
    root: passwd.dir,
    auth: true,
    oneFilePanel: true,
    keysPanel: false,
    console: false,
    terminal: false,
    configDialog: false,
    contact: false,
    **payload
  }

  # Update the config and remove port file
  FileUtils.mkdir_p File.dirname(config_path)
  File.write(config_path, config.to_json)
  FileUtils.rm_f port_path

  # Generate the command
  cmd = FlightFileManager.config
                         .cloudcmd_command
                         .gsub('$config_path', config_path)
                         .gsub('$port_path', port_path)
  FlightFileManager.logger.info("Executing Command: #{cmd}")

  # Create the log directory
  log_path = File.join(FlightFileManager.config.log_dir, 'cloudcmd', "#{current_user}.log")
  FileUtils.mkdir_p File.dirname(log_path)

  # XXX: Stash the PID and use it for persistent sessions
  pid = Kernel.fork do
    # XXX: Should SIGTERM be trapped here?
    # What should happen to the child processes when the server exists?
    # XXX: Remove the config file path on exit

    # Open the logging file descriptor before switching user permissions
    log_io = File.open(log_path, 'a')

    # Become the session leader as the correct user
    Process::Sys.setgid(passwd.gid)
    Process::Sys.setuid(passwd.uid)
    Process.setsid

    # Exec into the cloud command
    Kernel.exec({},
                *cmd.split(' '),
                unsetenv_others: true,
                close_others: true,
                chdir: passwd.dir,
                [:out, :err] => log_io)
  end
  FileUtils.mkdir_p File.dirname(pid_path)
  File.write pid_path, pid
  FlightFileManager.logger.info "Created cloudcmd for '#{current_user}' (PID: #{pid})"

  # Wait until the port is written or the daemon exists
  timeout = Process.clock_gettime(Process::CLOCK_MONOTONIC) + FlightFileManager.config.launch_timeout
  loop do
    break if Process.wait2(pid, Process::WNOHANG)
    break if File.exists?(port_path)
    sleep 1
    if (now = Process.clock_gettime(Process::CLOCK_MONOTONIC)) > timeout
      timeout = now + FlightFileManager.config.launch_timeout
      Process.kill('SIGTERM', pid)
    end
  end

  # Do not wait for cloudcmd to exit, also ensures it is still running
  begin
    Process.detach(pid)
  rescue Errno::ESRCH
    status 500
    halt({
      errors: ['Failed to create cloudcmd process']
    })
  end

  # Return the payload
  status 201
  payload.merge(port: File.read(port_path)).to_json
end

delete '/cloudcmd' do
  # Extract the PID
  pid = read_pid

  # Terminate the existing instance
  if pid
    begin
      FlightFileManager.logger.info "Shutting down '#{current_user}' cloudcmd server (PID: #{pid})"
      Process.kill('SIGTERM', pid)
    rescue Errno::ESRCH
      # NOOP - Don't worry if it has already ended
    end
  else
    status 204
    halt
  end

  # Determine if the process has finished
  finished = nil
  if pid
    begin
      finished = Process.getpgid(pid) ? false : true
    rescue Errno::ESRCH
      finished = true
    end
  end

  if finished
    FlightFileManager.logger.info "'#{current_user}' cloudcmd server has shutdown successfully"
    FileUtils.rm_f pid_path
    status 204
  else
    FlightFileManager.logger.info "'#{current_user}' cloudcmd server should shutdown"
    status 202
  end
end

