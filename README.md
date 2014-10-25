# What is Pretty Good ID?

Pretty Good ID (PGID) is a proposed authentication system to replace passwords. It is able to co-exist with passwords, and can be added quite easily to existing systems.

For a high level overview, please visit: http://www.pgid.org/

# Technical overview

## Key format

A PGID is basically a 2048-bit RSA key in the [PEM format](https://www.openssl.org/docs/apps/rsa.html). This is the default format used by OpenSSL, and is chosen due to widespread support in terms of available libraries.

Here's an example of a PGID:
```
-----BEGIN PGID HEADER-----
pgid-uid: ebd27005ed5310fa43a2defb4113d42bd9d46c6e
pgid-desc: Andrew Lee
pgid-fullname: Andrew Lee
pgid-shortname: andrew_lee
pgid-email: andrew@portablefreeware.com
-----END PGID HEADER-----
-----BEGIN RSA PRIVATE KEY-----
MIIEoQIBAAKCAQBe+2YqVpOmVmlb43fhSYf/pSFix9jwwit5p1h2Sxfhtun2djzj
NhOQPg5SWmunvA43m87GlLq+0Im4js06E4VowbhZhgeiXRqXDS3nkcKyuqwQTA2C
                              ......
yKNdKT6IVaOHUbK6EyySgehSQ55zX4kw3FMK7JEXklsOOHkqptD04EP5qPEt+qei
QGKD29NXNzezi1mVkHg9eM/scozdHw5H8i0uyh0zXM4mgYyrKA==
-----END RSA PRIVATE KEY-----
-----BEGIN PUBLIC KEY-----
MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBe+2YqVpOmVmlb43fhSYf/
pSFix9jwwit5p1h2Sxfhtun2djzjNhOQPg5SWmunvA43m87GlLq+0Im4js06E4Vo
                              ......
JX2hlhBLXGZ0qJ9VNB4GipiRaMf36QZ6HNuwa2UoxeCfvY9IUegoX0VOs+CcjMWQ
OBevtpwkzegYEEWrzb1E/w/efRImrQ3J+bikgSQMgsA9vujWIzAoPnHw/2Kb7fzL
AgMBAAE=
-----END PUBLIC KEY----- 
```
There are three sections to each PGID:

* PGID header
* RSA private key in PEM format
* RSA public key in PEM format

The PGID header consists of the following fields:

* *pgid-uid*: (required) A unique ID computed by taking the SHA1 hash of the private key text and converted to hex string format (160 bits => 20 bytes => 40 hex chars).
* *pgid-desc*: (optional) A descriptive label for UI display purpose. If this is not available, the UID will be displayed instead.
* *pgid-fullname*: (optional) Used to prefill registration pages where info is required.
* *pgid-shortname*: (optional) Used to prefill registration pages where info is required. This corresponds to the nickname used for most forum software.
* *pgid-email*: (optional) Used to prefill registration pages where info is required.

For ease of transfer between devices, the proposed method is to render this key as a QR-code so that it can be transferred via image capture or email and imported to another device.

The key text is compressed via ZLIB, encrypted with AES using a random 16-digit PIN, converted to ASCII via Base64, then rendered as QR-code. Importing the QR-code is simply the reverse process.

The QR-code is treated as a disposable, one-time use object for the purpose of PGID transfer. If the QR-code ever gets captured by a third party, it will be useless without the PIN, hence the reason for AES encryption.

## API

These are currently the APIs provided by PGID:

* Registration
* Login
* Update password to PGID
* Update PGID to PGID


### Registration

The web page advertises its support for registration via PGID by including this line in its header:
```
<link rel="pgid-register" href="http://demo.pgid.org/pgid-register.php" />
```
This should be added to the existing registration page of the website.

The PGID browser addon, on detecting this line, will expose the relevant UI to the user.

PGID registration is a two-phase, challenge-response process.

In the challenge phase, the client sends a JSON message to the target URL (http://demo.pgid.org/pgid-register.php):
```
{
  cmd: 'register',
  pgid: '<PGID headers> + <public key in PEM format>'
}
```
The server responds by generating a 240-byte authentication token and encrypt it using the public key provided:
```
{
  token: '<240-byte auth token encrypted using public key>'
}
```
The client decrypts the token and responds with another JSON message to prove that it owns the private key:
```
{
  cmd: 'register',
  pgid: '<PGID headers> + <public key in PEM format>'
  token: '<240-byte auth token>'
}
```
If the authentication token matches, the server brings the client to the usual registration form (prefilled with details in the PGID header) where the client has a certain time window to complete the registration.

The public key can be stored in the password field of the existing database. This involves minimal changes to the database schema (at most a widening of the password field).

### Login

The web page advertises its support for login via PGID by including this line in its header:
```
<link rel="pgid-login" href="http://demo.pgid.org/pgid-login.php" />
```
This should be added to the existing login page of the website.

The PGID browser addon, on detecting this line, will expose the relevant UI to the user.

PGID login is a two-phase, challenge-response process.

In the challenge phase, the client sends a JSON message to the target URL (http://demo.pgid.org/pgid-login.php):
```
{
  cmd: 'login',
  pgid: '<public key in PEM format>'
}
```
The server responds by generating a 240-byte authentication token and encrypt it using the public key provided:
```
{
  token: '<240-byte auth token encrypted using public key>'
}
```
The client decrypts the token and responds with another JSON message to prove that it owns the private key:
```
{
  cmd: 'login',
  pgid: '<PGID headers> + <public key in PEM format>'
  token: '<240-byte auth token>'
}
```
If the authentication token matches, the server goes through with the login process, which typically involves creating a session and assigning the relevant session cookies.

### Update password to PGID

The web page advertises its support for updating the authentication credentials from password to PGID by including this line in its header:
```
<link rel="pgid-updatepw" href="http://demo.pgid.org/pgid-updatepw.php" />
```
This should be added to the existing password update page of the website.

The PGID browser addon, on detecting this line, will expose the relevant UI to the user. This typically involves letting the user enter his current password, and select a PGID to update to.

As before, the update involves a two-phase, challenge-response process.

In the challenge phase, the client sends a JSON message to the target URL (http://demo.pgid.org/pgid-updatepw.php):
```
{
  cmd: 'updatepw',
  password: '<current password>',
  npgid: '<public key in PEM format>'
}
```
The server checks if the password matches the hash stored in the database. If so, it generates a 240-byte authentication token and encrypt it using the public key provided:
```
{
  token: '<240-byte auth token encrypted using public key>'
}
```
The client decrypts the token and responds with another JSON message to prove that it owns the private key:
```
{
  cmd: 'updatepw',
  password: '<current password'>,
  npgid: '<public key in PEM format>',
  token: '<240-byte auth token>'
}
```
If the authentication token matches, the server updates the user account and redirects to a web page to show that the update has been successful.

Most websites provide a function for handling forgotten passwords. This typically involves sending a confirmation link to the user's email address. The confirmation link brings the user to a web page where he can reset his password.

If a user loses his PGID, it can be handled the same way. Once the password has been reset, the user can proceed to update the password to a new PGID.

### Update PGID to PGID

The web page advertises its support for updating from one PGID to another by including this line in its header:
```
<link rel="pgid-update" href="http://demo.pgid.org/pgid-update.php" />
```
This should be added to the existing password update page of the website.

The PGID browser addon, on detecting this line, will expose the relevant UI to the user. This typically involves letting the user select his current PGID, and select a new PGID to update to.

The update involves a two-phase, challenge-response process.

In the challenge phase, the client sends a JSON message to the target URL (http://demo.pgid.org/pgid-update.php):
```
{
  cmd: 'updatepw',
  opgid: '<public key of old PGID in PEM format>',
  npgid: '<public key of new PGID in PEM format>'
}
```
The server responds by generating _two_ authentication tokens and encrypts them to the old and new public key respectively:
```
{
  otoken: '<240-byte auth token encrypted using old public key>',
  ntoken: '<240-byte auth token encrypted using new public key>'
}
```
The client decrypts the tokens and responds with another JSON message to prove that it owns _both_ keys:
```
{
  cmd: 'update',
  opgid: '<public key of old PGID in PEM format>',
  npgid: '<public key of new PGID in PEM format>'
  otoken: '<240-byte auth token>',
  ntoken: '<240-byte auth token>'
}
```
If both authentication tokens match, the server updates the user account and redirects to a web page to show that the update has been successful.

# Source code

* *chrome*: Source code for Chrome extension. Source files starting with '@', as well as all files under 'common', 'ext' and 'images' should be synchronized with the Firefox addon (under 'data').

* *firefox*: Source code for Firefox addon. Under 'data', source files starting with '@', as well as all files under 'common', 'ext' and 'images' should be synchronized with the Chrome extension.

* *firefox_mobile*: Source code for Firefox Mobile addon. Source files under 'data/common' should be synchronized with the chrome and firefox extension/addon.

* *php*: Demo website for testing the PGID protocol. Create database using 'pgid.sql', and change database login details in 'global.php'.

# Todo

* PGID plugin for phpBB
* PGID plugin for Wordpress

