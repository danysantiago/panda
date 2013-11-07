var Project = require('./Models/Projects');
var Session = require('./Models/Session');
var Users = require('./Models/Users');
var Repositories = require('./Models/Repositories');
var proj, user, repo, session;

/**
* @constructor
*/
function Gitlab(logObj){
	this.project = new Project(logObj);
	this.user = new Users(logObj);
	this.repository = new Repositories(logObj);
	this.session = new Session(logObj);
}

module.exports = Gitlab;