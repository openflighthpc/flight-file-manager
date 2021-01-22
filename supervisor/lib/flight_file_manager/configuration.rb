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

module FlightFileManager
  class Configuration
    autoload(:Loader, 'flight_file_manager/configuration/loader')

    PRODUCTION_PATH = 'etc/flight-file-manager.yaml'
    PATH_GENERATOR = ->(env) { "etc/flight-file-manager.#{env}.yaml" }

    class ConfigError < StandardError; end

    ATTRIBUTES = [
      {
        name: 'port',
        env_var: false,
        default: 920
      },
      {
        name: 'pidfile',
        env_var: true,
        default: ->(root) { root.join('var/puma.pid') }
      },
      {
        name: 'pam_service',
        env_var: true,
        default: 'login'
      },
      {
        name: 'cache_dir',
        env_var: true,
        default: ->(root) { root.join('var/cache') }
      },
      {
        name: 'log_dir',
        env_var: true,
        default: ->(root) { root.join('var/log') }
      },
      {
        name: 'log_level',
        env_var: true,
        default: 'info'
      },
      {
        name: 'cloudcmd_command',
        env_var: true,
        default: ->(root) do
          root.join('libexec/cloudcmd.sh').to_path
        end
      },
      {
        name: 'launch_timeout',
        env_var: false,
        default: 10
      }
    ]
    attr_accessor(*ATTRIBUTES.map { |a| a[:name] })

    def self.load(root)
      if ENV['RACK_ENV'] == 'production'
        Loader.new(root, root.join(PRODUCTION_PATH)).load
      else
        paths = [
          root.join(PATH_GENERATOR.call(ENV['RACK_ENV'])),
          root.join(PATH_GENERATOR.call("#{ENV['RACK_ENV']}.local")),
        ]
        Loader.new(root, paths).load
      end
    end

    def log_level=(level)
      @log_level = level
      FlightFileManager.logger.send("#{@log_level}!")
    end
  end
end
