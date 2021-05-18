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

## POST - /cloudcmd

Create a new cloudcmd session. Returns the `password` to access the cloudcmd session and the `url` fragment where it is being
hosted.

NOTE: The `url` fragment does not contain the hypertext protocol used to access the service. It will need to be prefixed with either `http:` or `https:` before accessing the service.

```
POST /cloudcmd
Authorization: Basic <base64 username:password>
Accepts: application/json

HTTP/2 201 CREATE
{
  "password": <string>,
  "url": <string>
}
```

The request MAY specify which directory the file manager should be open at with the `dir` query argument. The `dir` MUST be one of the following:
1. An absolute path to the user's home directory or sub-directories,
2. A relative path from the user's home directory that meets the first condition when expanded.

`422 Unprocessable Entity` SHALL be returned if the directory is invalid.

```
POST /cloudcmd?dir=<relative-path>
Authorization: Basic <base64 username:password>
Accepts: application/json
```


## DELETE - /cloudcmd

Destroy an existing cloudcmd session. It SHOULD return `201 - ACCEPTED` or `204 - NO CONTENT` under normal operations. It SHALL return `204 - NO CONTENT` if the session has successfully terminated. It SHOULD return `204 - NO CONTENT` if there is no actively running session. It SHALL return `201 - ACCEPTED` when there is a pre-existing `cloudcmd` session which SHOULD exit after the response has been issued.

```
DELETE /cloudcmd
Authorization: Basic <base64 username:password>
Accepts: application/json

HTTP/2 204 NO CONTENT
HTTP/2 202 ACCEPTED
```
