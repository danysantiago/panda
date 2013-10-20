var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID;

function Users(db) {
  this.db = db;
  this.collection = db.collection('users');
}

Users.prototype.findById =  function(id, callback) {
  this.collection.findOne({'_id': new ObjectID(id)}, callback);
}
 
Users.prototype.findOne = function(query, callback) {
  this.collection.findOne(query,callback);
}

Users.prototype.checkPassword = function(user, password) {
  return user.password === password;
}

module.exports = Users;