var config = require("./config.json");

var path = require('path');

var APP_MODE = "development"; //Default app mode

module.exports = (function() {
    //Get environment variable
    if(!process.env.NODE_ENV) {
        console.log("App defaulted to NODE_ENV=" + APP_MODE);
        process.env.NODE_ENV = APP_MODE;
    }

    //Load config file with environment
    var conf = config[process.env.NODE_ENV];

    if(!conf) {
        throw new Error("Invalid NODE_ENV: " + process.env.NODE_ENV);
    }

    if(!conf.appPort) {
        throw new Error("appPort must be set in config.");
    }

    conf.root = path.normalize(__dirname + '/../');

    return conf;
}());