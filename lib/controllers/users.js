var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID,
    revalidator = require('revalidator');

function Users(db) {
  this.db = db;
  this.collection = db.collection('users');
}

var schema = {
  'properties': {
    'role': {
      'required': true,
      'type': 'string',
      'pattern': /student|professor/i,
      'messages': {
        'pattern': 'must be either student or professor'
      }
    },
    'email': {
      'required': true,
      'type': 'string',
      'format': 'email'
    },
    'password': {
      'required': true,
      'type': 'string',
      'minLength': 4,
      'maxLength': 25,
    },
    'firstName': {
      'required': true,
      'type': 'string',
      'minLength': 2,
      'maxLength': 25,
    },
    'lastName': {
      'required': true,
      'type': 'string',
      'minLength': 2,
      'maxLength': 25,
    }
  }
};

Users.prototype.check = function(userObj) {
  return revalidator.validate(userObj, schema, {'validateFormatsStrict': true});
};

Users.prototype.findById =  function(id, callback) {
  this.collection.findOne({'_id': new ObjectID(id)}, {'deleted':0}, callback);
};
 
Users.prototype.findOne = function(query, callback) {
  this.collection.findOne(query, {'deleted':0}, callback);
};

Users.prototype.insert = function(userObj, callback) {
  userObj.deleted = false;
  this.collection.insert(userObj, callback);
};

Users.prototype.checkPassword = function(user, password) {
  return user.password === password;
};

module.exports = Users;