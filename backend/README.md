# Flight File Manager Backend

Backend for Flight File Manager.  This serves the file management requests
from the client.  See [the main README](/README.md) for more details.

# Installation

## From source

Flight File Manager backend requires a recent version of Node and `yarn`.

The following will install from source using `git`.

* Checkout the source code:

```
git clone https://github.com/alces-flight/flight-file-manager.git
```

* Build the `cloudcmd` library:

```
cd flight-file-manager/backend/lib/cloudcmd
yarn install
yarn run build
```

* Build the per-user backend:

```
cd flight-file-manager/backend
yarn install
```

The per-user backend will be started by the [API process](/api) as and when it
is required.

## Installing with Flight Runway

See details in [the main README](/README.md).

# Contributing

Fork the project. Make your feature addition or bug fix. Send a pull
request. Bonus points for topic branches.

Read [CONTRIBUTING.md](/CONTRIBUTING.md) for more details.

# Copyright and License

Eclipse Public License 2.0, see [LICENSE.txt](/LICENSE.txt) for details.

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
