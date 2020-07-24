const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const clear = require('clear');
const chalk = require("chalk");
const figlet = require("figlet");
const validator = require("./lib/validator");
const upload = multer({
					dest: 'uploads/',
					limits: {
						fileSize: 10485760		// 10Mb max upload size
					}
				});

// Configure app to use bodyParser() to allow us to get data from POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API ROUTING LOGIC
app.post("/validate", upload.single("json"), function (req, res) {

  const version = req.query.version;

  // File not accepted due to size limits
  if (typeof req.file == "undefined") {
    res.send({ error: "File too large." });
  }
  // File is empty
  else if (req.file.size < 10) {
    res.send({ error: "File too small or empty." });
  }
  else if (version == null) {
    res.send({ error: "Request missing FinSpec schema version." });
  }
  else {
    let path = req.file.path;
    validator.validateFinSpec({ version, path }, function (message) {
      res.send(message);      
    });
  }
});

// START THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT);

clear();

// Splash
console.log(
  chalk.yellow(figlet.textSync("FinSpec", { horizontalLayout: "full" }))
);

console.log(
  chalk.yellow(`-----
    
    FinSpec validator is running! The magic happens on port ${PORT}.
    To use it, CURL in your file using syntax like this:
    "curl -XPOST localhost:${PORT}/validate?version=<schema_version> -F json=@/path/to/finspec.json"

    Please report issues or feedback to happytohelp@fixspec.com

-----`)
);
