# Flight File Manager

In-browser file manager for the OpenFlight project.

## Overview

Flight File Manager allows you to access your HPC environment files via a GUI
(graphical user interface) running in the comfort of your browser.

## Installation

### Installing with the OpenFlight package repos

Flight File Manager is available as part of the *Flight Web Suite*.  This is
the easiest method for installing Flight File Manager and all its
dependencies.  It is documented in [the OpenFlight
Documentation](https://use.openflighthpc.org/installing-web-suite/install.html#installing-flight-web-suite).

### Manual Installation

Flight File Manager consists of three separate components: [browser
client](client), [API process](api) and [per-user backend process](backend).
The installation instructions for each component can be found in its readme.

## Configuration

The installation section details the configuration that is required for Flight
File Manager Webapp.

For Flight File Manager API, making changes to the default configuration is
optional and can be achieved by editing the `flight-file-manager.yaml` file in
the `etc/` subdirectory of the tool.  [The file](etc/flight-file-manager.yaml)
is well documented and outlines all the configuration values available.

## Operation

### When installed with Flight Runway

The server can be started by running the following command:

```
[root@myhost ~]# flight service start file-manager-api
```

The server can be stopped by running the following command:

```
[root@myhost ~]# flight service stop file-manager-api
```

The webapp is accessible by
opening your browser and visiting the URL for your cluster with path `/files`.
E.g., if you have installed on a machine called `my.cluster.com` visit the URL
https://my.cluster.com/files.

Enter your username and password for the cluster.  You can then manage your
HPC environment's files.


# Contributing

Fork the project. Make your feature addition or bug fix. Send a pull
request. Bonus points for topic branches.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

# Copyright and License

Eclipse Public License 2.0, see [LICENSE.txt](LICENSE.txt) for details.

Copyright (C) 2021-present Alces Flight Ltd.

This program and the accompanying materials are made available under
the terms of the Eclipse Public License 2.0 which is available at
[https://www.eclipse.org/legal/epl-2.0](https://www.eclipse.org/legal/epl-2.0),
or alternative license terms made available by Alces Flight Ltd -
please direct inquiries about licensing to
[licensing@alces-flight.com](mailto:licensing@alces-flight.com).

flight-file-manager is distributed in the hope that it will be
useful, but WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER
EXPRESS OR IMPLIED INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR
CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY OR FITNESS FOR
A PARTICULAR PURPOSE. See the [Eclipse Public License 2.0](https://opensource.org/licenses/EPL-2.0) for more
details.
