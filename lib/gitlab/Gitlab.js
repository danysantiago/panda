var Project = require('./Models/Projects');
var Session = require('./Models/Session');
var Users = require('./Models/Users');
var Repositories = require('./Models/Repositories');
var proj, user, repo;

/**
* @constructor
*/
function Gitlab(){
	this.proj = new Project(console.log);
	this.user = new Users(console.log);
	this.repo = new Repositories(console.log);
}

module.exports = Gitlab;