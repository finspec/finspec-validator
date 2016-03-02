// Packages we need
var express    = require('express'),        // Node express (web server)
	app        = express(),                 // define our app using express
	bodyParser = require('body-parser'),	// To read uploaded json files
	fs  	   = require('fs'),				// Save files to the filesystem
	multer     = require('multer'),  		// Multi-part file uploads
	upload     = multer({ 
					dest: 'uploads/',
					limits: {
						fileSize: 3145728		// 3Mb max upload size
					}
				}),
	Logger 		= require("./lib/logger.min"),	// Bunyan logging
	Ajv 		= require('ajv'),				// Ajv for JSON schema validation
	ajv 		= Ajv(); 						// options can be passed

 

function readConfiguration(configFile) {
    content = fs.readFileSync(configFile).toString();
    try {
        return JSON.parse(content);
    } catch (e) {
        console.error("Exception parsing the config file, Exception: ", e);
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

function compileSchema(schemaFile) {
	schema = fs.readFileSync(schemaFile).toString();
	try {
		schema = JSON.parse(schema);
	} catch (e) {
		console.error("Exception parsing schema file " + schemaFile + " Exception: ", e);
	   	throw new Error(e);
	}
	ajv.addSchema(schema, 'finspec-0.1');
}

// Compile FinSpec schema
var schemaFile = 'schemas/0.1.json',
	schema = compileSchema(schemaFile);


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
		var valid = ajv.validate('finspec-0.1', data);
		if (!valid) {
			var error = ajv.errorsText();
			res.json({ pass: false, message: error });
			log.warn("File invalid FinSpec", error);
			return;
		}

		res.json({ pass: true, message: 'Good job!' });
		log.info("File valid FinSpec");
  	});
});



// START THE SERVER
var port = configs.port || 8080;
log.info("Starting validator on port " + port);
app.listen(port);
console.log('Magic happens on port ' + port);