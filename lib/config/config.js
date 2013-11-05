/**
  config.js - Config file loader
**/

var config = require('./config.json'),
    bunyan = require('bunyan'),
    path = require('path');

var log = bunyan.createLogger({'name': 'panda', 'level': 'debug'});

var APP_MODE = 'development'; //Default app mode

module.exports = (function() {
  //Get environment variable
  if(!process.env.NODE_ENV) {
    log.info('App defaulted to NODE_ENV=' + APP_MODE);
    process.env.NODE_ENV = APP_MODE;
  }

  //Load config file with environment
  var conf = config[process.env.NODE_ENV];

  if(!conf) {
    throw new Error('Invalid NODE_ENV: ' + process.env.NODE_ENV);
  }

  if(!conf.appPort) {
    throw new Error('appPort must be set in config.');
  }

  //Config holds app root and tmp paths
  conf.root = path.normalize(__dirname + '/../../');
  conf.tmp = path.join(conf.root, 'tmp');

  conf.env = process.env.NODE_ENV;

  return conf;
}());