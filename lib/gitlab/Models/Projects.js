var credentials = require('../credentials');

var request = require("request").defaults({"strictSSL": false}),
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
    "archive": function(name, username, callback){
        var self = this;
        var path = url.parse(baseURL+'/' + username + '/' + name + '/repository/archive', true);
        path.query['private_token'] = credentials.token;
        console.log(url.format(path));
        request({
            "url": url.format(path),
            "method": "GET",
            "json": false
        }, function (err, res, body) {
            log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },

    "create": function(userId, name, callback) {
        var self = this;

        var path = url.parse(projectsURL+'user/'+userId, true);
        path.query['private_token'] = credentials.token;
        path.query['name'] = name;

        request({
            "url": url.format(path),
            "method": "POST",
            "json": true
        }, function (err, res, body) {
            log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },

    "addMember": function(userId, name, callback) {
        var self = this;

        var path = url.parse(projectsURL+'user/'+userId, true);
        path.query['private_token'] = credentials.token;
        path.query['name'] = name;

        request({
            "url": url.format(path),
            "method": "POST",
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