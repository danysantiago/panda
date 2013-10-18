var mongodb = require('mongodb');

function Users(db) {
  this.db = db;
}

Users.prototype.findById = function(id, callback) {
  this.db.collection('users').findOne({'_id': id}, callback);
}

Users.prototype.findOne = function(query, callback) {
  this.db.collection('users').findOne(query, callback);
}

Users.prototype.checkPassword = function(user, password) {
  return user.password === password;
}

module.exports = Users;