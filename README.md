# The FinSpec Specification Validator

The FinSpec validator is a tool designed to validate that FinSpec JSON documents correctly match the specification as defined [here](http//finspec.io), or to return error messages indicating where the validation is failing.

## Launch the server

1. Install Node JS, if not done already. You can find installables [here.](https://nodejs.org/en/download/)

2. Launch terminal and go to finspec-validator folder. Run the validator server using command:

   ```js
   node server.js
   ```
   
3. Keep this sever running in background or foreground to be able to perform the validations.

## How to validate

Your schema can be validated using following command:

```js   
curl -XPOST localhost:8080/validate?version<schema_version> -F json=@/path/to/finspec.json
```
   
Where,
	schema_version is target FinSpec schema version.

e.g.
   
   Version 0.1:
   ```js
   curl -XPOST localhost:8080/validate?version=0.1 -F json=@./myschema-0.1.json 
   {"pass":true,"message":"Good job!"}
   ```
   Version 0.2:
   ```js
   curl -XPOST localhost:8080/validate?version=0.2 -F json=@./myschema-0.2.json 
   {"pass":true,"message":"Good job!"}
   ```
