var credentials = require('../credentials');

var request = require('request').defaults({'strictSSL': false}),
querystring = require('querystring'),
url = require('url');

var baseURL = credentials.url;    
var projectsURL = baseURL + '/api/v3/projects/';
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
	if(logFunc && typeof logFunc === 'function') {
		logFunc('Repositories Request:');
	
		if(!err) {
			logFunc({
				'request': {
					'method': res.req.method,
					'path': res.req.path,
					'headers': res.req._headers
				},
				'response': {
					'statusCode': res.statusCode,
					'headers': res.headers,
					'body': body
				});
		} 
		else {
			logFunc(err);
		}
	}
}

Repositories.prototype = {
	/**
	* Get file archive.
	* Get an archive of the repository.
	*
	* @param params
	* @param params.username username of the owner (required)
	* @param params.name name of the project (required)
	*/
	'archive': function(params, out, callback){
		var self = this;
		var tmp = '/' + params.username + '/';
		tmp+= params.name + '/repository/archive';
		var path = url.parse(baseURL+tmp, true);
		path.query['private_token'] = credentials.token;

			request({
				'url': url.format(path),
				'method': 'GET',
				'json': false
			}, function (err, res, body) {
				log(self.logFunc, err, res, body);

			if(typeof callback === 'function') {
				callback(err, res, body);
			}
		}).pipe(out);
	},

	/**
	* List repository branches.
	* Get a list of repository branches from a project, 
	* sorted by name alphabetically.
	*
	* @param params
	* @param params.id id of the project (required)
	*/
	'getBranches': function(params, callback){
		var self = this;
		var tmp = params.id + '/repository/branches';
		var path = url.parse(projectsURL + tmp, true);
		path.query['private_token'] = credentials.token;

		request({
			'url': url.format(path)+'&'+(querystring.stringify(params)),
			'method': 'GET',
			'json': true
		}, function (err, res, body) {
			log(self.logFunc, err, res, body);

			if(typeof callback === 'function') {
				callback(err, res, body);
			}
		}); 
	},

	/**
	* Get single repository branch.
	* Get a single project repository branch.
	*
	* @param params
	* @param params.id id of the project (required)
	* @param params.branch name of the branch (required)
	*/
	'getBranch': function(params, callback){
		var self = this;
		var tmp = params.id + '/repository/branches/'+params.branch
		var path = url.parse(projectsURL + tmp, true);
		path.query['private_token'] = credentials.token;

		request({
			'url': url.format(path)+'&'+(querystring.stringify(params)),
			'method': 'GET',
			'json': true
		}, function (err, res, body) {
			log(self.logFunc, err, res, body);

			if(typeof callback === 'function') {
				callback(err, res, body);
			}
		});
	},

	/**
	* List repository commits.
	* Get a list of repository commits in a project.
	*
	* @param params
	* @param params.id id of the project (required)
	* @param params.ref_name name of repository branch 
	*                        or tag or if not given 
	*                        the default branch (optional)
	*/
	'getCommits': function(params, callback){
		var self = this;
		var tmp = params.id + '/repository/commits';
		var path = url.parse(projectsURL + tmp, true);
		path.query['private_token'] = credentials.token;

		request({
			'url': url.format(path)+'&'+(querystring.stringify(params)),
			'method': 'GET',
			'json': true
		}, function (err, res, body) {
			log(self.logFunc, err, res, body);

			if(typeof callback === 'function') {
				callback(err, res, body);
			}
		});
	},

	/**
	* Get a single commit.
	* Get a specific commit identified by the commit 
	* hash or name of a branch or tag.
	*
	* @param params
	* @param params.id id of the project (required)
	* @param params.sha commit hash or name of a 
	*                   repository branch or tag (required)
	*/
	'getCommit': function(params, callback){
		var self = this;
		var tmp = params.id + '/repository/commits/'+params.sha;
		var path = url.parse(projectsURL + tmp, true);
		path.query['private_token'] = credentials.token;

		request({
			'url': url.format(path)+'&'+(querystring.stringify(params)),
			'method': 'GET',
			'json': true
		}, function (err, res, body) {
			log(self.logFunc, err, res, body);

			if(typeof callback === 'function') {
				callback(err, res, body);
			}
		}); 
	},

	/**
	* Get the diff of a commit.
	* Get the diff of a commit in a project.
	*
	* @param params
	* @param params.id id of the project (required)
	* @param params.sha name of a repository branch 
	*                   or tag or if not given the 
	*                   default branch (required)
	*/
	'getDiff': function(params, callback){
		var self = this;
		var tmp = params.id + '/repository/commits/'+params.sha + '/diff/';
		var path = url.parse(projectsURL + tmp, true);
		path.query['private_token'] = credentials.token;

		request({
			'url': url.format(path)+'&'+(querystring.stringify(params)),
			'method': 'GET',
			'json': true
		}, function (err, res, body) {
			log(self.logFunc, err, res, body);

			if(typeof callback === 'function') {
				callback(err, res, body);
			}
		}); 
	},

	/**
	* List repository tree.
	* Get a list of repository files and directories in a project.
	*
	* @param params
	* @param params.id id of the project (required)
	* @param params.path path inside repository. 
	*                    Used to get content of 
	*                    subdirectories (optional)
	* @param params.ref_name name of a repository branch 
	*                        or tag or if not given 
	*                        the default branch (optional)
	*/
	'listTree': function(params, callback){
		var self = this;
		var tmp = params.id + '/repository/tree';
		var path = url.parse(projectsURL + tmp, true);
		path.query['private_token'] = credentials.token;

		request({
			'url': url.format(path)+'&'+(querystring.stringify(params)),
			'method': 'GET',
			'json': true
		}, function (err, res, body) {
			log(self.logFunc, err, res, body);

			if(typeof callback === 'function') {
				callback(err, res, body);
			}
		}); 
	},

	/**
	* Raw blob content.
	* Get the raw file contents for a file.
	*
	* @param params
	* @param params.id id of the project (required)
	* @param params.sha commit or branch name (required)
	* @param params.filepath path of the file (required)
	*/
	'getBlob': function(params, callback){
		var self = this;
		var tmp = params.id + '/repository/blobs/'+params.sha;
		var path = url.parse(projectsURL + tmp, true);
		path.query['private_token'] = credentials.token;

		request({
			'url': url.format(path)+'&'+(querystring.stringify(params)),
			'method': 'GET',
			'json': false
		}, function (err, res, body) {
			log(self.logFunc, err, res, body);

			if(typeof callback === 'function') {
				callback(err, res, body);
			}
		}); 
	}
};

module.exports = Repositories;