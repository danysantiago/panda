var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID,
    revalidator = require('revalidator'),
    async = require('async'),
    _ = require('underscore'),
    utils = require('../utils.js');

function Courses(db) {
  this.db = db;
  this.collection = db.collection('courses');
}

var schema = {
  'properties': {
    'Users': {
      'type': 'array'
    },
    'Assignments': {
      'type': 'array'
    },
    'name': {
      'required': true,
      'type': 'string',
    },
    'code': {
      'required': true,
      'type': 'string',
    },
    'year': {
      'required': true,
      'type': 'string',
      'pattern': /20[0-9]{2}/,
      'messages': {
        'pattern': 'not a valid year number (20XX)'
      }
    },
    'semester': {
      'required': true,
      'type': 'string',
      'pattern': /spring|fall/i,
      'messages': {
        'pattern': 'must be either spring or fall'
      }
    },
    'grader': {
      'required': true,
      'type': 'string',
      'pattern': utils.mongoObjectIdRegEx
    }
  }
  //TODO (Daniel): Missing grader nested property
};

Courses.prototype.check = function(courseObj) {
  return revalidator.validate(courseObj, schema, {'validateFormatsStrict': true});
};

Courses.prototype.findById =  function(id, callback) {
  var query = {
    '_id': new ObjectID(id),
    'deleted': false
  };

  var projections = {'deleted':0};

  this.collection.findOne(query, projections, callback);
};
 
Courses.prototype.findOne = function(query, callback) {
  query.deleted = false;

  var projections = {'deleted':0};

  this.collection.findOne(query, projections, callback);
};

Courses.prototype.findAll = function(callback) {
  var query = {'deleted': false};

  var projections = {'deleted':0};

  this.collection.find(query, projections).toArray(callback);
};

Courses.prototype.findUserCourses = function(userId, callback) {
  var query = {
    $or: [
      {'Users': new ObjectID(userId)},
      {'Graders.id': new ObjectID(userId)}
    ],
    'deleted': false
  };

  var projections = {'deleted':0};

  this.collection.find(query, projections).toArray(callback);
};

Courses.prototype.insert = function(courseObj, callback) {
  courseObj.Users = [];
  courseObj.Assignments = [];
  courseObj.Graders = [
    {'id': new ObjectID(courseObj.grader), 'permissions': 4}
  ]
  courseObj.deleted = false;

  delete courseObj.grader

  this.collection.insert(courseObj, callback);
};

Courses.prototype.insertUser = function(courseId, userId, callback) {
  var query = {
    '_id': new ObjectID(courseId),
    'deleted': false
  }; 

  var update = {
    $addToSet: { 'Users': new ObjectID(userId) }
  };

  this.collection.update(query, update, callback);
};

Courses.prototype.removeUser = function(courseId, userId, callback) {
  var query = {
    '_id': new ObjectID(courseId),
    'deleted': false
  }; 

  var update = {
    $pull: { 'Users': new ObjectID(userId) }
  };

  this.collection.update(query, update, callback);
};

Courses.prototype.del = function(id, callback) {
  var query = {
    '_id': new ObjectID(id),
    'deleted': false
  };

  var update = {
    'deleted': true
  };
  
  this.collection.findAndModify(query, null, update, callback);
};

module.exports = Courses;