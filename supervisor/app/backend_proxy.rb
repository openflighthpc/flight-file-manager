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

class BackendProxy < Rack::Proxy

  def rewrite_env(env)
    script_name_prefix = FlightFileManager.config.mount_point
    user = current_user(env)
    port = backend_port_for_user(user)

    # 1. Ensure that we're using HTTP and not HTTPS.
    # 2. Set the correct port.
    # 3. Add back the prefix that `config.ru` has stripped off and cloudcmd is
    #    expecting.
    env["HTTPS"] = "off"
    env["HTTP_X_FORWARDED_SSL"] = "off"
    env["HTTP_X_FORWARDED_SCHEME"] = "http"

    env["HTTP_HOST"] = "localhost:#{port}"
    env["SCRIPT_NAME"] = "#{script_name_prefix}#{env["SCRIPT_NAME"]}"
    env
  end

  def rewrite_response(triplet)
    _status, headers, _body = triplet
    
    # Ensure that content length is recalculated, otherwise bad things may
    # happen.
    headers["content-length"] = nil

    triplet
  end

  private

  def current_user(env)
    # credentials = (env['HTTP_AUTHORIZATION'] || '').chomp.split(' ').last
    # username, _ = Base64.decode64(credentials).split(':', 2)
    # username

    match = env['PATH_INFO'].match(/^\/([^\/]*)/)
    username = match[1]
    username
  end

  def backend_port_for_user(user)
    port_path = File.join(FlightFileManager.config.cache_dir, user, 'cloudcmd.port')
    return nil unless File.exists?(port_path)
    port = File.read(port_path).chomp
    if port.empty?
      nil
    else
      port
    end
  end
end
