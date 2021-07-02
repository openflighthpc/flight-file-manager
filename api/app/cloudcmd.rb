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

class CloudCmd
  def initialize(user)
    @user = user
  end

  def run
    generate_password
    prepare
    run_subprocess
  end

  def kill
    Flight.logger.info "Shutting down cloudcmd server for '#{@user}' pid=#{pid}"
    begin
      Process.kill(-Signal.list['TERM'], pid)
    rescue Errno::ESRCH
      # NOOP - Don't worry if it has already ended
    end
    cleanup unless running?
  end

  def broken?
    running? && port.nil?
  end

  def running?
    return false if pid.nil?
    begin
      Process.getpgid(pid)
      true
    rescue Errno::ESRCH
      false
    end
  end

  def pid
    if File.exists?(pid_path)
      pid = File.read(pid_path).to_i
      if pid > 1
        pid
      else
        # Do not allow PID 0 or 1 to be returned! This is to prevent file read
        # issues feeding into the kill command.
      end
    else
      nil
    end
  end

  def port
    if File.exists?(port_path)
      port = File.read(port_path).chomp
      begin
        Integer(port)
      rescue TypeError, ArgumentError
        nil
      else
        port
      end
    else
      nil
    end
  end

  def password
    if File.exists?(password_path)
      File.read(password_path).chomp
    else
      nil
    end
  end

  def default_dir
    @default_dir ||= Etc.getpwnam(@user).dir
  end

  def root_dir
    '/'
  end

  def cloudcmd_config
    mount_point = Flight.config.mount_point
    {
      prefix: "#{mount_point}/backend/#{@user}",
      root: root_dir,
      auth: true,
      username: @user,
    }
  end

  private

  def prepare
    FileUtils.mkdir_p(File.dirname(config_path))
    File.write(config_path, cloudcmd_config.to_json)
    FileUtils.rm_f(port_path)
    FileUtils.rm_f(password_path)
    File.open(password_path, 'w', 0600) { |f| f.write(generate_password) }
    FileUtils.chown(@user, @user, password_path)
    FileUtils.mkdir_p(File.dirname(log_path))
  end

  def generate_password
    if File.executable?('/usr/bin/apg')
      begin
        Timeout.timeout(5) do
          `/usr/bin/apg -n1 -M Ncl -m 8 -x 8`.chomp
        end
      rescue Timeout::Error
        SecureRandom.urlsafe_base64[0..7].tr('-_','fl')
      end
    else
      SecureRandom.urlsafe_base64[0..7].tr('-_','fl')
    end
  end

  def run_subprocess
    cmd = [
      Flight.config.cloudcmd_command,
      '--config', config_path,
      '--password-path', password_path,
      '--port-path', port_path,
    ]
    Flight.logger.info(
      "Starting cloudcmd server for '#{@user}' command=#{redacted_cmd(cmd)}"
    )

    passwd = Etc.getpwnam(@user)
    pid = Kernel.fork do
      # XXX Should SIGTERM be trapped here?
      # XXX What should happen to the child processes when the server exists?

      # Open the logging file descriptor before switching user permissions
      log_io = File.open(log_path, 'a')

      # Create port_path before switching user permissions.  The cloudcmd
      # process may not have permission to create it otherwise.
      FileUtils.rm_f port_path
      FileUtils.touch port_path
      FileUtils.chown(@user, @user, port_path)

      # Jump through hoops to 1) drop the parent process's group permissions
      # and 2) add all groups for user.
      Process.groups = []
      Process.gid = passwd.gid
      Process.initgroups(@user, passwd.gid)
      Process.uid = passwd.uid
      Process.setsid

      Kernel.exec(
        {},
        *cmd,
        unsetenv_others: true,
        close_others: true,
        chdir: passwd.dir,
        [:out, :err] => log_io,
      )
    end

    write_pid(pid)
    Flight.logger.info("Created cloudcmd for '#{@user}' pid=#{pid}")
    wait_for_port_to_be_written
    Flight.logger.info("cloudcmd for '#{@user}' listening on port=#{port}")

    pid
  end

  def write_pid(pid)
    FileUtils.mkdir_p(File.dirname(pid_path))
    File.write(pid_path, pid)
  end

  # Wait until the port file is written, the daemon exits without writing the
  # port file, or a timeout is reached.
  def wait_for_port_to_be_written
    timeout = Process.clock_gettime(Process::CLOCK_MONOTONIC) + Flight.config.launch_timeout
    loop do
      break if Process.wait2(pid, Process::WNOHANG)
      if File.exists?(port_path)
        break unless File.read(port_path).empty?
      end
      sleep 1
      if (now = Process.clock_gettime(Process::CLOCK_MONOTONIC)) > timeout
        timeout = now + Flight.config.launch_timeout
        Process.kill(-Signal.list['TERM'], pid)
      end
    end
  end

  def cleanup
    FileUtils.rm_rf data_dir
  end

  def config_path
    data_file('cloudcmd.json')
  end

  def log_path
    File.join(Flight.config.log_dir, 'cloudcmd', "#{@user}.log")
  end

  def password_path
    data_file('cloudcmd.password')
  end

  def pid_path
    data_file('cloudcmd.pid')
  end

  def port_path
    data_file('cloudcmd.port')
  end

  def data_file(filename)
    File.join(data_dir, filename)
  end

  def data_dir
    File.join(Flight.config.data_dir, @user)
  end

  def redacted_cmd(cmd)
    last = nil
    cmd.reduce([]) do |accum, i|
      if last == '--password'
        accum << 'REDACTED'
      else
        accum << i
      end
      last = i
      accum
    end
  end
end
