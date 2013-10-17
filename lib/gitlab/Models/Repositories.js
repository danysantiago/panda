var credentials = require('../credentials');

var request = require("request").defaults({"strictSSL": false}),
    querystring = require('querystring'),
    url = require("url");

var baseURL = credentials.url;    

/**
* @constructor
* @param {logFunc} function function that logs data
*/
function Repositories(logFunc) {
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
        logFunc("Repositories Request:");
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

Repositories.prototype = {
    "archive": function(params, callback){
        var self = this;
        var path = url.parse(baseURL+'/' + params.username + '/' + params.name + '/repository/archive', true);
        path.query['private_token'] = credentials.token;
        
        request({
            "url": url.format(path)+'&'+(querystring.stringify(params)),
            "method": "GET",
            "json": false
        }, function (err, res, body) {
            log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },


};

module.exports = Repositories;