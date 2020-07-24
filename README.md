# The FinSpec Specification Validator

The FinSpec validator is a tool designed to validate that FinSpec JSON documents correctly match the specification as defined [here](https://finspec.io), or to return error messages indicating where the validation is failing.

## Installation

1. Install Node JS and NPM. If you do not have installed these already, grab them from [here.](https://nodejs.org/en/download/)

2. Git clone the repo (or download / unpack the zip).

3. Launch a terminal, cd into the install folder and download the node packages with `npm install`.

4. If you'd like to run the validation as a service, then you will also need the ability to send a curl request to the web port. This might be using a utility like [curl](https://curl.haxx.se/download.html), or an application like Postman.

5. Pat yourself on the back.


## Validating FinSpec Documents From Command Line

If you just need to validate FinSpec documents on an ad-hoc basis, then the easiest way to do this is using the command-line interface.

Simply cd into the installation folder and run:

   ```js
   node index.js
   ```


## Validating FinSpec Documents As A Web Service

This package leverages Node express, allowing the validation logic to be exposed as a microservice over a network. Perhaps to allow multiple users or processes to validate FinSpec documents on demand. To set up this simple microservice 

1. Starting up the microservice is as simple as running the following command in the installation folder:

   ```js
   node server.js
   ```

2. Your schema can now be validated by using curl like this:

```js   
curl -XPOST localhost:9999/validate?version=<schema_version> -F json=@/path/to/finspec.json
```

Where `<schema_version>` is target FinSpec schema version.

e.g.

   Version 3.0 (Current Version):
   ```js
   curl -XPOST localhost:3000/validate?version=3.0 -F json=@./myschema-3.0.json
   {"pass":true,"message":"Good job!"}
   ```

   Version 2.1 (prior version):
   ```js
   curl -XPOST localhost:3000/validate?version=2.1 -F json=@./myschema-2.1.json
   {"pass":true,"message":"Good job!"}
   ```

**NOTE** This validator is only supporting versions 2.x and 3.x of the schema. All 0.x versions are no longer supported. Please contact FixSpec at happytohelp@fixspec.com for assistance upgrading from an older schema version.


By default, the node application uses port 3000. If you prefer a different port, simply indicate a different port on start-up like this:

   ```js
   PORT=9999 node server.js
   ```
