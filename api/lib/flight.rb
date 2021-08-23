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

require 'active_support/core_ext/object/blank'
require 'active_support/string_inquirer'

module Flight
  class << self
    def config
      return @config if @config
      @config = FlightFileManager::Configuration.load
      @config.__logs__.log_with(logger)
      @config
    end
    alias_method :load_configuration, :config

    def root
      @root ||= if env.production? && ENV["flight_ROOT"].present?
        File.expand_path(ENV["flight_ROOT"])
      else
        File.expand_path('..', __dir__)
      end
    end

    def env
      @env ||= ActiveSupport::StringInquirer.new(
        ENV['RACK_ENV'].presence || "development"
      )
    end

    def logger
      @logger ||= Logger.new($stdout, level: config.log_level.to_sym)
    end
  end
end
