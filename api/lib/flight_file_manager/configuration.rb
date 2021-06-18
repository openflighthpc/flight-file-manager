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

require 'active_model'

module FlightFileManager
  class Configuration
    extend FlightConfiguration::DSL
    include ActiveModel::Validations

    RC = Dotenv.parse(File.join(Flight.root, 'etc/web-suite.rc'))

    application_name 'file-manager-api'

    class ConfigError < StandardError; end

    [
      {
        name: 'bind_address',
        env_var: true,
        default: "tcp://127.0.0.1:920"
      },
      {
        name: 'shared_secret_path',
        env_var: true,
        default: 'etc/shared-secret.conf',
        transform: relative_to(root_path)
      },
      {
        name: 'sso_cookie_name',
        env_var: true,
        default: 'flight_login'
      },
      {
        name: 'data_dir',
        env_var: true,
        default: 'var/lib/file-manager-api',
        transform: relative_to(root_path)
      },
      {
        name: 'log_dir',
        env_var: true,
        default: 'var/log/file-manager-api',
        transform: relative_to(root_path)
      },
      {
        name: 'log_level',
        env_var: true,
        default: 'info'
      },
      {
        name: 'cloudcmd_command',
        env_var: true,
        default: 'libexec/file-manager-api/cloudcmd.sh',
        transform: relative_to(root_path)
      },
      {
        name: 'cloudcmd_cookie_name',
        env_var: true,
        default: 'flight_file_manager_backend',
      },
      {
        name: 'cloudcmd_cookie_domain',
        env_var: true,
        default: ->() { RC['flight_WEB_SUITE_domain'] }
      },
      {
        name: 'cloudcmd_cookie_path',
        env_var: true,
        default: '/files/backend',
      },
      {
        name: 'launch_timeout',
        env_var: true,
        default: 10
      },
      {
        name: 'mount_point',
        env_var: true,
        default: '/files'
      },
    ].each { |opts| attribute(opts[:name], **opts) }

    # Ensure the shared_secret_path exists and isn't empty
    validate do
      unless File.exists?(shared_secret_path) && File.stat(shared_secret_path).size?
        errors.add(:shared_secret_path, :missing, message: "does not exist or is empty: #{shared_secret_path}")
      end
    end

    def auth_decoder
      @auth_decoder ||= FlightAuth::Builder.new(shared_secret_path)
    end
  end
end
