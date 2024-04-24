# This directory contains a proxy server for cloudcmd

For each user using Flight File Manager, the [API server](/api) launches a
[cloudcmd process](/backend) process.  The process is provided with credentials
that are created by the API server.  The credentials for cloudcmd are not the
same credentials used to sign into Flight Web Suite.  [This
server](/backend-proxy) is a reverse proxy to the cloudcmd process.  It
examines the Flight Web Suite credentials, determines which cloudcmd process
should be proxied to and determines the correct credentials for that process.
Then it proxies the request.

The original backend proxy was written in Ruby, used rack-proxy and ran under
Puma.  Whilst it worked, it unfortunately had a memory leak.  It appears that
the memory leak was in either Puma, or net/http.  Uploading or downloading
large files would result in the File Manager API process consuming large
amounts of memory and being killed by the OOM killer.

Attempts to fix this in the Ruby reverse proxy were not successful, so a
non-ruby solution has been implemented.

The reverse proxy is very simple.  It needs to do the following:

1. Check that the referer header is acceptable and abort if not.
2. Obtain the credentials from the cloudcmd cookie.
3. Map the username given in the cloudcmd cookie to a port.
4. Proxy the request to that port, providing the credentials retrieved from the
   cookie.
5. Process each request in a constant amount of memory.

Any server in any language that can do that would be suitable.  This one is
written in Go.
