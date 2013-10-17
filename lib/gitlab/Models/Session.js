var credentials = require('../credentials');

var request = require("request").defaults({"strictSSL": false}),
    querystring = require('querystring'),
    url = require("url");

var baseURL = credentials.url;

var sessionUrl = baseURL + "/api/v3/session/";    

/**
* @constructor
* @param {logFunc} function function that logs data
*/
function Session(logFunc) {
    this.logFunc = logFunc;
}

/**
* Logs all requests in pretty format
* @param logFunc function that logs to console
* @param err error of execution
* @param res response from server
* @param body body from response
*/
function log(logFunc, err, res, body) {
    if(logFunc && typeof logFunc === "function") {
        logFunc("Session Request:");
        if(!err) {
            logFunc({
                "request": {
                    "method": res.req.method,
                    "path": res.req.path,
                    "headers": res.req._headers
                },
                "response": {
                    "statusCode": res.statusCode,
                    "headers": res.headers,
                    "body": body
                }
            });
        } else {
            logFunc(err);
        }
    }
}

Session.prototype = {
    "login": function(params, callback){
        var self = this;
        var path = url.parse(sessionUrl, true);
        
        request({
            "url": url.format(path)+'?'+(querystring.stringify(params)),
            "method": "POST",
            "json": false
        }, function (err, res, body) {
            log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },


};

module.exports = Session;