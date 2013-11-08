var config = require('../../config/config.js'),
    credentials = require('../credentials'),
    request = require('request').defaults({'strictSSL': false}),
    querystring = require('querystring'),
    url = require('url'),
    spawn = require('child_process').spawn,
    stream = require('stream'),
    async = require('async'),
    fs = require('fs'),
    utils = require('../../utils.js');


var baseURL = credentials.url;

var projectsURL = baseURL + '/api/v3/projects/';    

/**
* @constructor
* @param {logObj} function function that logs data
*/
function Projects(logObj) {
  this.logObj = logObj;
}

/**
* Logs all requests in pretty format
* @param logObj function that logs to console
* @param err error of execution
* @param res response from server
* @param body body from response
*/
function log(logObj, err, res, body) {
  if(logObj) {
    logObj.debug('Projects Request:');
    if(!err) {
      logObj.debug({
        'request': {
          'method': res.req.method,
          'path': res.req.path,
          'headers': res.req._headers
        },
        'response': {
          'statusCode': res.statusCode,
          'headers': res.headers,
          'body': body
        }
      });
    } 

    else {
      logObj.debug(err);
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
  'create': function(params, callback) {
    var self = this;

    var path = url.parse(projectsURL+'user/'+params.user_id, true);
    path.query.private_token = credentials.token;

    request({
      'url': url.format(path)+'&'+(querystring.stringify(params)),
      'method': 'POST',
      'json': true
    }, function (err, res, body) {
      log(self.logObj, err, res, body);

      if(typeof callback === 'function') {
        callback(err, res, body);
      }
    });
  },

  /**
  * Initialize repository.
  * Initialize git repository.
  *
  * @param params
  * @param params.name name of the project (required)
  * @param params.username username of the owner (required)
  * @param params.archive archive file to initialize project 
  *                       with (.tar or .zip, optional)
  */
  'populate': function(params, callback) {
    var self = this;

    var tmpZipPath;

    async.waterfall([

      function (done) {
        //Check if archive is given in a buffer or file path
        if (typeof params.archive === 'object' && 
            params.archive.buffer instanceof Buffer) {

          var suffix = '';
          if(params.archive.type === 'application/zip') {
            suffix = '.zip';
          } else if (params.archive.type === 'application/gzip') {
            suffix = '.tar.gz';
          }

          tmpZipPath = utils.generateTmpPath(config.tmp) + suffix;

          fs.writeFile(tmpZipPath, params.archive.buffer,
              function (err) {
            params.archive = tmpZipPath;
            done(err);
          });
        } else if (typeof params.archive === 'string') {
          done();
        } else {
          params.archive = undefined;
          done();
        }
      },

      function (done) {
        var script = __dirname + '/../createRepo.sh';

        var args = [
          params.name, //Project name
          'root', //Admin username *Danger?
          'aguacate', //Admin password *Danger?
          params.username,
          params.archive
        ];
        
        var createScript = spawn(script, args);

        var scriptStdout = '';
        var scriptStderr = '';

        createScript.stdout.on('data', function (data) {
          scriptStdout += data;
        });

        createScript.stderr.on('data', function (data) {
          scriptStderr += data;
        });

        createScript.on('close', function (code) {
          if(self.logObj) {
            self.logObj.debug('createScript exit code: ' + code);
            self.logObj.debug(scriptStdout);
            self.logObj.debug(scriptStderr);
          }

          var error;
          if(code !== 0) {
            error = {
              'code': code,
              'msg': scriptStderr
            };
          }

          done(error);
        });
      }

    ], function (err) {
      if(typeof callback === 'function') {
        callback(err);
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
  'addMember': function(params, callback) {
    var self = this;
    var path = url.parse(projectsURL+params.id+'/members/', true);
    path.query.private_token = credentials.token;
    
    if(!params.access_level) {
      path.query.access_level = 40;
    }

    request({
      'url': url.format(path)+'&'+(querystring.stringify(params)),
      'method': 'POST',
      'json': true
    }, function (err, res, body) {
      log(self.logObj, err, res, body);

      if(typeof callback === 'function') {
        callback(err, res, body);
      }
    });
  },

  /**
  * List projects.
  * Get a list of projects owned by authenticated user.
  */
  'getAll': function(callback){
    var self = this;
    var path = url.parse(projectsURL, true);
    path.query.private_token = credentials.token;

    request({
      'url': url.format(path),
      'method': 'GET',
      'json': true
    }, function (err, res, body) {
      log(self.logObj, err, res, body);

      if(typeof callback === 'function') {
        callback(err, res, body);
      }
    });
  },

  /**
  * Get single project.
  * Get a specific project.
  *
  * @param params
  * @param params.id id or namespace/project_name of a project (required)
  */
  'get': function(params, callback){
    var self = this;
    var path = url.parse(projectsURL+params.id, true);
    path.query.private_token = credentials.token;

    request({
      'url': url.format(path)+'&'+(querystring.stringify(params)),
      'method': 'GET',
      'json': true
    }, function (err, res, body) {
      log(self.logObj, err, res, body);

      if(typeof callback === 'function') {
        callback(err, res, body);
      }
    });
  },

  /**
  * Delete project.
  * Delete a project.
  *
  * @param params
  * @param params.name name of the project (required)
  * @param params.username username of the owner of the project
  */
  'delete': function(params,callback){
    var self = this;
    var path = url.parse(baseURL+'/' + params.username + '/' + params.name, 
    true);
    path.query.private_token = credentials.token;

    request({
      'url': url.format(path),
      'method': 'DELETE',
      'json': true
    }, function (err, res, body) {
      log(self.logObj, err, res, body);

      if(typeof callback === 'function') {
        callback(err, res, body);
      }
    });
  }
};

module.exports = Projects;