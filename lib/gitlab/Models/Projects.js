var credentials = require('../credentials');

var request = require("request").defaults({"strictSSL": false}),
    querystring = require('querystring'),
    url = require("url");

var baseURL = credentials.url;

var projectsURL = baseURL + "/api/v3/projects/";    

/**
* @constructor
* @param {logFunc} function function that logs data
*/
function Projects(logFunc) {
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
        logFunc("Projects Request:");
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

Projects.prototype = {
    "create": function(params, callback) {
        var self = this;

        var path = url.parse(projectsURL+'user/'+params.user_id, true);
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

    "addMember": function(params, callback) {
        var self = this;
        var path = url.parse(projectsURL+params.id+'/members/', true);
        path.query['private_token'] = credentials.token;
        path.query['access_level'] = 40;

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
        var path = url.parse(projectsURL, true);
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
        var path = url.parse(projectsURL+params.id, true);
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

    "getByName": function(params,callback){
        var self = this;
        var path = url.parse(projectsURL+'search/'+params.name, true);
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
    } 
};

module.exports = Projects;