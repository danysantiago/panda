var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID,
    revalidator = require('revalidator'),
    crypto = require("crypto");

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
  var query = {
    '_id': new ObjectID(id),
    'deleted': false
  };

  var projections = {'deleted':0, 'salt': 0};

  this.collection.findOne(query, projections, callback);
};
 
Users.prototype.findOne = function(query, callback) {
  query.deleted = false;

  var projections = {'deleted':0};j

  this.collection.findOne(query, projections, callback);
};

Users.prototype.findAll = function(callback) {
  var query = {'deleted': false};

  var projections = {'deleted':0, 'salt': 0};

  this.collection.find(query, projections).toArray(callback);
};

Users.prototype.findAllIn = function(userIdsArr, callback) {
  var query = {
    '_id': {$in: userIdsArr},
    'deleted': false
  };

  var projections = {'deleted':0, 'salt': 0};

  this.collection.find(query, projections).toArray(callback);
};

Users.prototype.insert = function(userObj, callback) {
  userObj.deleted = false;
  userObj.salt = makeSalt();
  userObj.password = encryptPassword(userObj.password, userObj.salt);

  this.collection.insert(userObj, callback);
};

Users.prototype.del = function(id, callback) {
  var query = {
    '_id': new ObjectID(id),
    'deleted': false
  };

  var update = {
    'deleted': true
  };
  
  this.collection.findAndModify(query, null, update, callback);
};

Users.prototype.checkPassword = function(user, password) {
  return user.password === encryptPassword(password, user.salt);
};

function makeSalt() {
  return Math.round((new Date().valueOf() * Math.random())) + '';
}

function encryptPassword(password, salt) {
  return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

module.exports = Users;