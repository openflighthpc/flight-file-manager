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

require 'sinatra'
require_relative 'config/boot'

Flight.load_configuration
# Ensures the shared secret exists
Flight.config.auth_decoder

require_relative 'config/post_boot'
require_relative 'app'

configure do
  LOGGER = Flight.logger
  enable :logging, :dump_errors
  set :raise_errors, true
end

at_exit do
  # No really - kill sessions
  at_exit { CloudCmd.kill_instances('KILL') }

  # Terminate sessions
  CloudCmd.kill_instances('TERM')
end

app = Rack::Builder.new do
  # This has been replaced by ../backend-proxy/
  # map('/backend') { run BackendProxy.new }
  map('/v0') { run App }
end

run app
