# The FinSpec Specification Validator

The FinSpec validator is a tool designed to validate that FinSpec JSON documents correctly match the specification as defined [here](http//finspec.io), or to return error messages indicating where the validation is failing.

## Installation

1. Install Node JS and NPM. If you do not have installed these already, grab them from [here.](https://nodejs.org/en/download/)

2. You will also need curl. If this isn't installed by default on your operating system, it can be downloaded from [here.](https://curl.haxx.se/download.html).

3. Git clone the repo (or download / unpack the zip).

4. Launch a terminal, cd into the install folder and download the node packages with `npm install`.

5. Pat yourself on the back.

## Validating  validate

1. Launch terminal and go to the installation folder. Run the validator server using command:

   ```js
   node server.js
   ```
   
2. Keep this sever running in background or foreground to be able to perform the validations.

3. Your schema can now be validated by using curl like this:

```js   
curl -XPOST localhost:8080/validate?version=<schema_version> -F json=@/path/to/finspec.json
```
   
Where,
	schema_version is target FinSpec schema version.

e.g.
   
   Version 1.1 (Current Version):
   ```js
   curl -XPOST localhost:8080/validate?version=1.1 -F json=@./myschema-1.1.json 
   {"pass":true,"message":"Good job!"}
   ```
   
   Version 1.0:
   ```js
   curl -XPOST localhost:8080/validate?version=1.0 -F json=@./myschema-1.0.json 
   {"pass":true,"message":"Good job!"}
   
   ```
   Version 0.3 (Prior Version):
   ```js
   curl -XPOST localhost:8080/validate?version=0.3 -F json=@./myschema-0.3.json 
   {"pass":true,"message":"Good job!"}
   ```