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
    /**
     * Create User.
     * Creates a new user.
     *
     * @param params
     * @param params.email email (required)
     * @param params.password password (required)
     * @param params.username username (required)
     * @param params.name name (required)
     * @param params.skype skype (optional)
     * @param params.linkedin Linkedin (optional)
     * @param params.twitter Twitter account (optional)
     * @param params.projects_limit number of projects user can create (optional)
     * @param params.extern_uid external uid (optional)
     * @param params.provider external provider name (optional)
     * @param params.bio user's bio (optional)
     * @param params.admin user is admin (true or false [default], optional)
     * @param params.can_create_group user can create groups (true or false, optional)
     */
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

    /**
     * List Users.
     * Get a list of users
     */
    "getAll": function(callback){
        var self = this;
        var path = url.parse(usersURL, true);
        path.query['private_token'] = credentials.token;

        request({
            "url": url.format(path),
            "method": "GET",
            "json": true
        }, function (err, res, body) {
            //log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },

    /**
     * Get User.
     * Get a single user.
     *
     * @param params
     * @param params.id the id of the user
     */
    "get": function(params, callback){
        var self = this;
        var path = url.parse(usersURL+params.user_id, true);
        path.query['private_token'] = credentials.token;

        request({
            "url": url.format(path)+'&'+(querystring.stringify(params)),
            "method": "GET",
            "json": true
        }, function (err, res, body) {
            //log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },

    /**
     * Modify User.
     * Modifies an existing user.
     *
     * @param params
     * @param params.id id the user (required)
     * @param params.email email
     * @param params.username username
     * @param params.name name
     * @param params.skype skype id
     * @param params.linkedin linkedin
     * @param params.twitter twitter account
     * @param params.projects_limit limit projects each user can create
     * @param params.extern_uid external uid
     * @param params.provider external provider name
     * @param params.bio user's bio
     * @param params.admin user is admin
     * @param params.can_create_group user can create groups
     */
    "modify": function(params, callback){
        var self = this;
        var path = url.parse(usersURL+params.user_id, true);
        path.query['private_token'] = credentials.token;
        
        request({
            "url": url.format(path)+'&'+(querystring.stringify(params)),
            "method": "PUT",
            "json": true
        }, function (err, res, body) {
            //log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    }, 

    /**
     * Get Current User.
     * Get currently authenticated user.
     */
    "getCurrent": function(callback){
        var self = this;
        var path = url.parse(baseURL+'user', true);
        path.query['private_token'] = credentials.token;
        
        request({
            "url": url.format(path),
            "method": "GET",
            "json": true
        }, function (err, res, body) {
            //log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    }
};

module.exports = Users;