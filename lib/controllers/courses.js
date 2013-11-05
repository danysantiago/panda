/**
  course.js - DB controller for the courses collection
**/

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

//Course schema
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
      'pattern': /[a-zA-Z]{4}[0-9]{4}/
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
      'pattern': /spring|fall|summer/i,
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

//Validate function of schema
Courses.prototype.check = function(courseObj) {
  return revalidator.validate(courseObj, schema,
    {'validateFormatsStrict': true});
};

//Query course by its id
Courses.prototype.findById =  function(id, callback) {
  var query = {
    '_id': new ObjectID(id),
    'deleted': false
  };

  var projections = {'deleted':0};

  this.collection.findOne(query, projections, callback);
};
 
//Query a single course, query is given by function as parameter
Courses.prototype.findOne = function(query, callback) {
  query.deleted = false;

  var projections = {'deleted':0};

  this.collection.findOne(query, projections, callback);
};

//Query all courses on the collection
Courses.prototype.findAll = function(callback) {
  var query = {'deleted': false};

  var projections = {'deleted':0};

  this.collection.find(query, projections).toArray(callback);
};

//Query all courses a user (student or professor) is tied to
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

//Insert a course doc into the DB
Courses.prototype.insert = function(courseObj, callback) {
  courseObj.Users = [];
  courseObj.Assignments = [];
  courseObj.Graders = [
    {'id': new ObjectID(courseObj.grader), 'permissions': 4}
  ];
  courseObj.code = courseObj.code.toUpperCase();
  courseObj.deleted = false;

  delete courseObj.grader;

  this.collection.insert(courseObj, callback);
};

//Push a student into the course's user list
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

//Pull a student from the course's user list
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

//Soft delete a course from the DB
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