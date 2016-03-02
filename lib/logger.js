/**
 * @preserve Copyright 2014 FixSpec Limited.
 * All rights reserved.
 */

var bunyan = require("bunyan");

/**
 * @global
 * @access public
 * @description Initiates Bunyan logger
 * @param {string} name - Name of the app (appears in log)
 * @param {string} logfile Path to log file output
 * @param {string} loglevel Bunyan logging level [fatal|error|warn|info|debug|trace]
 * @returns {object} Bunyan Logger instance 
 */
function initLogger(name, logfile, loglevel) {

    log = bunyan.createLogger({
        name: name,
        level: loglevel,
        streams: [{
        	type: 'rotating-file',
            path: logfile,
            count: 30
        }]
    });

    return log;
}

/**
 * @global
 * @access public
 * @description Replaces $DATE with today's date
 * @param {string} string - The string before substition
 * @returns {string} string - The string after substition 
 */
function getLogger() {
	return log;
}

exports.initLogger = initLogger;
exports.getLogger = getLogger;
