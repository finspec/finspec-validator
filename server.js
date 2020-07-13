// Packages we need
var express    = require('express'),        // Node express (web server)
	app        = express(),                 // define our app using express
	bodyParser = require('body-parser'),	// To read uploaded json files
	fs  	   = require('fs'),				// Save files to the filesystem
	multer     = require('multer'),  		// Multi-part file uploads
	upload     = multer({
					dest: 'uploads/',
					limits: {
						fileSize: 10485760		// 10Mb max upload size
					}
				}),
	Logger 		= require("./lib/logger"),	    // Bunyan logging
	Ajv 		= require('ajv'),				// Ajv for JSON schema validation
	ajv 		= new Ajv({
					schemaId: 'auto',
					extendRefs: true
				  });

// Allow both draft-04 and draft-06/07 schemas
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

function readConfiguration(configFile) {
    content = fs.readFileSync(configFile).toString();
    try {
        return JSON.parse(content);
    } catch (e) {
        console.log("Exception parsing the config file, Exception: ", e);
        throw new Error(e);
    }
}

//Read the configuration
var configs = readConfiguration('server.cfg');

//Logger details
log = Logger.initLogger('finspec-validator', configs.logfile, configs.loglevel);
if (log == null) {
	console.log("Error: Failed to create log file: ", logfile);
    process.exit(0);
}

function compileSchema(schemaFile, version) {
	schema = fs.readFileSync(schemaFile).toString();
	try {
		schema = JSON.parse(schema);
	} catch (e) {
		console.log("Exception parsing schema file " + schemaFile + " Exception: ", e);
	   	throw new Error(e);
	}
	ajv.addSchema(schema, 'finspec-' + version);
}

// Compile FinSpec schemas
// compileSchema('schemas/0.1.json', '0.1');
// compileSchema('schemas/0.2.json', '0.2');
// compileSchema('schemas/0.3.json', '0.3');
// compileSchema('schemas/1.0.json', '1.0');
// compileSchema('schemas/1.1.json', '1.1');
// compileSchema('schemas/1.2.json', '1.2');
compileSchema('schemas/2.0.json', '2.0');
compileSchema('schemas/2.1.json', '2.1');


// Configure app to use bodyParser() to allow us to get data from POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


function validateJSON(body) {
  try {
    var data = JSON.parse(body);
    return data;
  } catch(e) {
    return null;
  }
}


function getClientIp(req) {
  var ipAddress = null;
  var forwardedIpsStr = req.headers['x-forwarded-for'];
  if (forwardedIpsStr) {
    ipAddress = forwardedIpsStr[0];
  }
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
}


// API ROUTING LOGIC
app.post('/validate', upload.single('json'), function (req, res, next) {

	log.info("Incoming validate from", getClientIp(req));

	var version = req.query.version;
	log.info("FinSpec schema version:", version);

	// File not accepted due to size limits
	if(typeof req.file == 'undefined') {
		res.writeHead(413, {'Content-Type': 'text/plain'});
		res.end("File too large.");
		req.connection.destroy();
		log.warn("Validate rejected - too large");
		return;
	}
	// File is empty
	else if(req.file.size < 10) {
		res.writeHead(413, {'Content-Type': 'text/plain'});
		res.end("File too small or empty.");
		req.connection.destroy();
		log.warn("Validate rejected - too small");
		return;
	}
	else if (version == null) {
		res.writeHead(413, {'Content-Type': 'text/plain'});
		res.end("Request missing FinSpec schema version.");
		req.connection.destroy();
		log.warn("Request missing FinSpec schema version.");
		return;
	}
	else if (["2.0","2.1"].indexOf(version) == -1) {
		res.writeHead(413, {'Content-Type': 'text/plain'});
		res.end("Request has invalid FinSpec schema version: " + version);
		req.connection.destroy();
		log.warn("Request has invalid FinSpec schema version: " + version);
		return;
	}

	log.info("Upload stored", req.file);

  	fs.readFile(req.file.path, function (err, data) {
		var data = validateJSON(data);
		if (!data) {
			res.writeHead(413, {'Content-Type': 'text/plain'});
			res.end("File was not valid JSON.");
			req.connection.destroy();
			log.error("File invalid JSON");
			return;
		}

		// Try validating the doc against the schema
		var valid = ajv.validate('finspec-' + version, data);
		var message;
		if (!valid) {
			var error = ajv.errorsText();
			message = { pass: false, message: error };
			log.warn("File invalid FinSpec", error);
		}

		else {
			log.info("File valid FinSpec");
			message = { pass: true, message: 'Good job!' };
		}

		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(message, null, 3) + "\n");
  	});
});



// START THE SERVER
var port = configs.port || 9999;
log.info("Starting validator on port " + port);
app.listen(port);
console.log("\n-----");
console.log('FinSpec validator is running! The magic happens on port ' + port);
console.log('To use it, CURL in your file using syntax like this:');
console.log('curl -XPOST localhost:9999/validate?version=<schema_version> -F json=@/path/to/finspec.json');
console.log('Please report issues or feedback to happytohelp@fixspec.com');
console.log("-----\n");
