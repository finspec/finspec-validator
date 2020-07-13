const fs = require('fs');

// Ajv for JSON schema validation
const Ajv = require('ajv');				
const ajv = new Ajv({
              schemaId: 'auto',
              extendRefs: true
            });


// Allow both draft-04 and draft-06/07 schemas
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));


// Compile the FinSpec Schemas
function compileSchema(schemaFile, version) {
  var schema = fs.readFileSync(schemaFile).toString();
  if(!schema) return false;

  try {
    schema = JSON.parse(schema);
    ajv.addSchema(schema, "finspec-" + version);
    return true;
  }
  catch (e) {
    return false;
  }
}

// Validate that the data is valid json
function validateJSON(data) {
  try {
    data = JSON.parse(data);
    return data;
  }
  catch(e) {
    return null;
  }
}

// Run the validation
module.exports = {
  validateFinSpec: (params, callback) => {
    let version = params.version;
    let path = params.path;

    // Compile the requested schema
    let schema = compileSchema(`./schemas/${version}.json`, version);
    if(!schema) {
      return {
        pass: false,
        error: "Invalid schema " + version
      }
    } 
    
    // Read the requested file
    fs.readFile(path, function (err, data) {
      var message;

      // File read errors
      if (err) {
        message = {
          pass: false,
          error: "Can not open file at " + path
        }
      }

      // Check it is valid JSON
      else {
        data = validateJSON(data);

        if (!data) {
          message = {
            pass: false,
            error: "File was not valid JSON.",
          };
        }

        // Try validating the doc against the schema
        else {
          let valid = ajv.validate("finspec-" + version, data);
          if (!valid) {
            message = {
              pass: false,
              error: ajv.errorsText(),
            };
          } else {
            message = {
              pass: true,
            };
          }
        }
      }

      callback(message);
    });
  }
}