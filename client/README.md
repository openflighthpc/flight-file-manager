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

## When installed with Flight Runway

When Flight File Manager Webapp is installed with Flight Runway, configuration
is provided through [Flight Landing
page](https://github.com/openflighthpc/flight-landing-page).  See the
README.md file in that repo for details.

## When installed form source

When Flight File Manager Webapp is installed from source, the configuration is
loaded from URLs which are set via environment variables when the application
is built.  These environment variables are set and documented in the `.env`
file.

Example configuration files can be found in the [public](public/) directory.
In particular, the [public/data](public/data/) and
[public/styles](public/styles) directories.


## Bookmarks

Bookmarks are specified in the JSON file loaded from the URL given by
`REACT_APP_DATA_FILE`, defaulting to `/data/index.json`.

To create a new bookmark, add a new JSON entry to the `bookmarks` array in the
form:

```json
{
  "bookmarks": [
    {
      "id": "desktop",
      "path": "Desktop/",
      "text": "Desktop",
      "fa_icon": "desktop"
    }
  ]
}
```

Where `id` is a unique identifier for the bookmark; `path` is the relative or
absolute path to the directory; `text` is the text used for the dropdown menu
item; and `fa_icon` is optional and if given the name of Font Awesome icon to
use.

If the path is a relative path (i.e., it does not begin with `/`) it is
relative to the user's home directory.

There is currently a known issue where if the bookmark path matches a file
instead of a directory, the File Manager will become unresponsive until it is
reloaded.

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
