var credentials = require('../credentials');

var request = require("request").defaults({"strictSSL": false}),
    url = require("url"),
    querystring = require('querystring');

var baseURL = credentials.url;

var usersURL = baseURL + "/api/v3/users/";    

/**
* @constructor
* @param {logFunc} function function that logs data
*/
function Users(logFunc) {
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
        logFunc("Users Request:");
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

Users.prototype = {
    "create": function(params, callback) {
        var self = this;

        var path = url.parse(usersURL, true);
        path.query['private_token'] = credentials.token;

        request({
            "url": url.format(path)+'&'+(querystring.stringify(params)),
            "method": "POST",
            "json": true
        }, function (err, res, body) {
            log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },

    "getAll": function(callback){
        var self = this;
        var path = url.parse(usersURL, true);
        path.query['private_token'] = credentials.token;

        request({
            "url": url.format(path),
            "method": "GET",
            "json": true
        }, function (err, res, body) {
            log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },

    "get": function(params, callback){
        var self = this;
        var path = url.parse(usersURL+params.user_id, true);
        path.query['private_token'] = credentials.token;

        request({
            "url": url.format(path)+'&'+(querystring.stringify(params)),
            "method": "GET",
            "json": true
        }, function (err, res, body) {
            log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },

    "modify": function(params, callback){
        var self = this;
        var path = url.parse(usersURL+params.user_id, true);
        path.query['private_token'] = credentials.token;
        
        request({
            "url": url.format(path)+'&'+(querystring.stringify(params)),
            "method": "PUT",
            "json": true
        }, function (err, res, body) {
            log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    }, 

    "getCurrent": function(callback){
        var self = this;
        var path = url.parse(baseURL+'user', true);
        path.query['private_token'] = credentials.token;
        
        request({
            "url": url.format(path),
            "method": "GET",
            "json": true
        }, function (err, res, body) {
            log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    }
};

module.exports = Users;