/*
 Copyright 2014 FixSpec Limited.
 All rights reserved.
*/
var bunyan=require("bunyan");function initLogger(a,b,c){return log=bunyan.createLogger({name:a,level:c,streams:[{type:"rotating-file",path:b,count:30}]})}function getLogger(){return log}exports.initLogger=initLogger;exports.getLogger=getLogger;
