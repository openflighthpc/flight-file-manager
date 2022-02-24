# Flight File Manager

In-browser file manager for the OpenFlight project.

## Overview

Flight File Manager allows you to access your HPC environment files via a GUI
(graphical user interface) running in the comfort of your browser.

## Installation

### From source

XXX TBC

### Installing with Flight Runway

Flight Runway provides a Ruby environment and command-line helpers for
running openflightHPC tools.  Flight File Manager integrates with Flight
Runway to provide easier installation and configuration.

To install Flight Runway, see the [Flight Runway installation
docs](https://github.com/openflighthpc/flight-runway#installation).

These instructions assume that `flight-runway` has been installed from
the openflightHPC yum repository and that either [system-wide
integration](https://github.com/openflighthpc/flight-runway#system-wide-integration)
has been enabled or the
[`flight-starter`](https://github.com/openflighthpc/flight-starter) tool has
been installed and the environment activated with the `flight start` command.

 * Enable the Alces Flight RPM repository:

    ```
    yum install -e0 https://repo.openflighthpc.org/openflight/centos/7/x86_64/openflighthpc-release-2-1.noarch.rpm
    ```

 * Rebuild your `yum` cache:

    ```
    yum makecache
    ```
    
 * Install the `flight-file-manager-*` RPMs:

    ```
    [root@myhost ~]# yum install flight-file-manager-webapp flight-file-manager-api
    ```

 * Enable HTTPs support

    Flight File Manager is designed to operate over HTTPs connections.  You
    can enable HTTPs with Let's Encrypt certificates by running the commands
    below.

    ```
    [root@myhost ~]# flight www cert-gen --cert-type letsencrypt --domain HOST --email EMAIL
    [root@myhost ~]# flight www enable-https
    ```

 * Configure details about your cluster

    Flight File Manager Webapp needs to be configured with some details about
    the cluster it is providing access to.  This can be done with the `flight
    service configure` command as described below.  You will be asked to
    provide values for:

    **Cluster name**: set it to a string that identifies this cluster in a
    human friendly way.

    **Cluster description**: set it to a string that describes this cluster in
    a human friendly way.

    **Cluster logo URL**: Optionally, set it to the URL for a logo for this
    cluster.  Or leave it unset.

    **Hostname or IP address**: set this to the fully qualified
    hostname for your server.  This name needs to resolve correctly and be the
    name used for the Let's Encrypt certificate created above. 

    Once you have values for the above, you can configure the webapp by running:

    ```
    [root@myhost ~]# flight service configure file-manager-webapp
    ```


## Configuration

The installation section details the configuration that is required for Flight
File Manager Webapp.

For Flight File Manager API, making changes to the default configuration is
optional and can be achieved by editing the `flight-file-manager.yaml` file in
the `etc/` subdirectory of the tool.  [The file](etc/flight-file-manager.yaml)
is well documented and outlines all the configuration values available.

By default, the Flight File Manager uses the production version of the API that is installed. To use the development version of the API:

Build the development version of the backend:
```
cd flight-file-manager/backend/lib/cloudcmd
/opt/flight/bin/yarn install
/opt/flight/bin/yarn run build
```

Set up the development version of the API:
```
cd flight-file-manager/api/
sudo /opt/flight/bin/bundle install
sudo /opt/flight/bin/ruby ./bin/puma
```

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
