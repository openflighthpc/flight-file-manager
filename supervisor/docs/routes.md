# Routes Overview

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://tools.ietf.org/html/bcp14) [[RFC2119](https://tools.ietf.org/html/rfc2119)] [[RFC8174](https://tools.ietf.org/html/rfc8174)] when, and only when, they appear in all capitals, as shown here.

## Authentication

All request SHOULD set the `Authorization` using the `Basic` authentication strategy with there `username` and `password`. The system by default will use the `pam` configuration for the `sshd` service but MAY be configured differently.

## GET - /ping

Test whether the service is operating correctly.
NOTE: Currently the request must be authenticated however this may change without notice.

```
GET /ping
Authorization: Basic <base64 username:password>
Accepts: application/json

HTTP/2 200 OK
{ "status": "OK" }
```

## POST - /cloudcmds

Create a new cloudcmd session. Return the `port` the cloudcmd server was started on and the `username`/`password` to access it.

A new `cloudcmd` session will not be created if one already exists for the user. Instead a `409 - Conflict` is returned with the existing details.

```
POST /cloudcmds
Authorization: Basic <base64 username:password>
Accepts: application/json

HTTP/2 201 CREATE
{
  "port": <integer>,
  "username": <string>,
  "password": <string>
}

HTTP/2 409 CONFLICT
{
  "port": <integer>,
  "username": <string>,
  "password": <string>,
  "errors": [
    <conflict-message>
  ]
}
```

