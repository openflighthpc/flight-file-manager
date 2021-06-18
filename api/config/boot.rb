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

ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)

require 'rubygems'
require 'bundler'
require 'yaml'
require 'json'
require 'pathname'

# NOTE: The RACK_ENV maybe modified during this require, so it must be done
# before loading the Flight stub
Bundler.require(:default)

# Limited use of dotenv to support setting flight_ENVIRONMENT=development.
# NOTE: The GitHub .env.development default is 'development', but the underlying default
#       is 'production' if both env files are omitted.
require 'dotenv'
dot_files = [ '../.env.development.local', '../.env.development' ].map do |file|
  File.expand_path(file, __dir__)
end
Dotenv.load(*dot_files)

# Shared activesupport libraries
require 'active_support/core_ext/hash/keys'
require 'active_support/core_ext/object/blank'
require 'active_support/string_inquirer'
require 'active_support/core_ext/module/delegation'

lib = File.expand_path('../lib', __dir__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'flight'

Bundler.require(:default, :development) if Flight.env.development?

require 'flight_file_manager'

Flight.load_configuration

require_relative '../app'
require_relative '../app/backend_proxy'
require_relative '../app/cloudcmd'
