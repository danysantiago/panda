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
    /**
     * Create project for user.
     * Creates a new project owned by user.
     *
     * @param params
     * @param params.user_id user_id of owner (required)
     * @param params.name new project name (required)
     * @param params.description short project description (optional)
     * @param params.default_branch (optional)
     * @param params.issues_enabled (optional)
     * @param params.wall_enabled (optional)
     * @param params.merge_requests_enabled (optional)
     * @param params.wiki_enabled (optional)
     * @param snippets_enabled (optional)
     * @param public (optional)
     */
    "create": function(params, callback) {
        var self = this;

        var path = url.parse(projectsURL+'user/'+params.user_id, true);
        path.query['private_token'] = credentials.token;

        request({
            "url": url.format(path)+'&'+(querystring.stringify(params)),
            "method": "POST",
            "json": true
        }, function (err, res, body) {
            //log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },

    /**
     * Initialize repository.
     * Initialize git repository.
     *
     * @param params
     * @param params.name name of the project (required)
     * @param params.username username of the owner (required)
     * @param params.archive archive file to initialize project with (.tar or .zip, optional)
     */
    "populate": function(params, callback) {
          var exec = require('child_process').exec;
          
          exec(__dirname + '/../createRepo.sh ' + params.name.toLowerCase() + ' nelii28o2 mofongo ' + params.username + ' ' + params.archive,
          function (error, stdout, stderr) {
            if(typeof callback === "function") {
                callback(error, stdout, stderr);
            }
        });
    },

    /**
     * Add project member.
     * Adds a user to a project team.
     *
     * @param params
     * @param params.id id of the project (required)
     * @param params.user_id id of the user to add (required)
     * @param params.access_level project access level (default 40)
     */
    "addMember": function(params, callback) {
        var self = this;
        var path = url.parse(projectsURL+params.id+'/members/', true);
        path.query['private_token'] = credentials.token;
        if(!params.access_level)
            path.query['access_level'] = 40;

        request({
            "url": url.format(path)+'&'+(querystring.stringify(params)),
            "method": "POST",
            "json": true
        }, function (err, res, body) {
            // log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },

    /**
     * List projects.
     * Get a list of projects owned by authenticated user.
     */
    "getAll": function(callback){
        var self = this;
        var path = url.parse(projectsURL, true);
        path.query['private_token'] = credentials.token;

        request({
            "url": url.format(path),
            "method": "GET",
            "json": true
        }, function (err, res, body) {
            // log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },

    /**
     * Get single project.
     * Get a specific project.
     *
     * @param params
     * @param params.id id or namespace/project_name of a project (required)
     */
    "get": function(params, callback){
        var self = this;
        var path = url.parse(projectsURL+params.id, true);
        path.query['private_token'] = credentials.token;

        request({
            "url": url.format(path)+'&'+(querystring.stringify(params)),
            "method": "GET",
            "json": true
        }, function (err, res, body) {
            // log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    },

    /**
     * Search for projects by name.
     * Search for projects by name which are public or the calling user has access to.
     *
     * @param params
     * @param params.query a string contained in the project name (required)
     * @param params.per_page number of projects to return per page (optional)
     * @param params.page page to retrieve (optional)
     */
    "getByName": function(params,callback){
        var self = this;
        var path = url.parse(projectsURL+'search/'+params.query, true);
        path.query['private_token'] = credentials.token;

        request({
            "url": url.format(path)+'&'+(querystring.stringify(params)),
            "method": "GET",
            "json": true
        }, function (err, res, body) {
            // log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    } ,

    /**
     * Delete project.
     * Delete a project.
     *
     * @param params
     * @param params.name name of the project (required)
     * @param params.username username of the owner of the project
     */
    "delete": function(params,callback){
        var self = this;
        var path = url.parse(baseURL+'/' + params.username + '/' + params.name, true);
        path.query['private_token'] = credentials.token;

        request({
            "url": url.format(path),
            "method": "DELETE",
            "json": true
        }, function (err, res, body) {
            // log(self.logFunc, err, res, body);

            if(typeof callback === "function") {
                callback(err, res, body);
            }
        })
    }
};

module.exports = Projects;