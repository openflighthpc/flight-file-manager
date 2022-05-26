# Flight File Manager Client

Browser client for Flight File Manager.  See [the main README](/README.md)
for more details.

# Installation

## From source

Flight File Manager Webapp requires a recent version of Node and `yarn`.

The following will install from source using `git`:

```
git clone https://github.com/alces-flight/flight-file-manager.git
cd flight-file-manager/client
yarn install
yarn run build
```

Flight File Manager Webapp has been built into `build/`.  It can be served by
any webserver configured to serve static files from that directory.  By
default, Flight File Manager Webapp expects to be served from a path of
`/files`.  If that does not suit your needs, see the configuration section
below for details on how to configure it.

## Installing with Flight Runway

See details in [the main README](/README.md).

# Configuration

## Bookmarks/common directories

At the moment, bookmarks are specified in the `REACT_APP_DATA_FILE`. To create a new bookmark, add a new JSON entry to the `bookmarks` array of the form:

```json
{
  "bookmarks": [
    {
      "path": "Desktop/",
      "text": "Desktop"
    }
  ]
}
```

Where `path` is the path to the directory, and `text` is the text used for the dropdown menu item. Include a preceding `/` to the `path` value to make the path absolute; omit it to make the path relative to the user's home directory.

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
