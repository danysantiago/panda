var Project = require('./Models/Projects');
var Session = require('./Models/Session');
var Users = require('./Models/Users');
var Repositories = require('./Models/Repositories');
var proj, user, repo, session;

/**
* @constructor
*/
function Gitlab(logFunc){
	this.project = new Project(logFunc);
	this.user = new Users(logFunc);
	this.repository = new Repositories(logFunc);
	this.session = new Session(logFunc);
}

module.exports = Gitlab;