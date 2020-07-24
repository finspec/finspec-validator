const bunyan=require("bunyan");

const log;

module.exports = {
  initLogger: (name, logfile, logLevel) => { 
      return log = bunyan.createLogger({
          name: name,
          level: logLevel,
          streams: [{
              type: "rotating-file",
              path: logfile,
              count: 30
          }]
      })
  },

  getLogger: () => {
      return log;
  }
}
