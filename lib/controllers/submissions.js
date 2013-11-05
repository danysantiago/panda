/**
  submissions.js - DB controller for the submissions collection
**/

var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID,
    revalidator = require('revalidator'),
    async = require('async'),
    _ = require('underscore'),
    utils = require('../utils.js');

function Submissions(db) {
  this.db = db;
  this.collection = db.collection('submissions');
}

var schema = {
  'properties': {
    'User': {
      'type': 'string',
      'pattern': utils.mongoObjectIdRegEx,
      'required': true
    },
    'Assignment': {
      'type': 'string',
      'pattern': utils.mongoObjectIdRegEx,
      'required': true
    }
  }
};

Submissions.prototype.check = function(subObj) {
  return revalidator.validate(subObj, schema,
    {'validateFormatsStrict': true});
};

Submissions.prototype.findById = function(id, callback) {
  var query = {
    '_id': new ObjectID(id),
  };

  var projections = {

  };

  this.collection.findOne(query, projections, callback);
};
 
Submissions.prototype.findOne = function(query, callback) {

};

Submissions.prototype.findAll = function(callback) {
  this.collection.find().toArray(callback);
};

Submissions.prototype.findUserSubmissions = function(userId, callback) {
  var query = {
    'User': new ObjectID(userId)
  };

  var projections = {

  };

  this.collection.find(query, projections).toArray(callback);
};

Submissions.prototype.findCourseSubmissions = function(courseId, callback) {
  var _db = this.db;

  var query = {
    'Course': new ObjectID(courseId)
  };

  var projections = {

  };

  this.collection.find(query, projections).toArray(function (err, submissions) {
    if (err) {
      return callback(err);
    }

    var userProjections = {'firstName':1, 'lastName': 1, 'email': 1};
    var assigProjections = {'name': 1};

    async.each(submissions, function (submission, forEachDone) {
      async.parallel([
        function (done) {
          _db.collection('users').findOne({'_id': submission.User},
              userProjections, function (err, user) {
            delete submission.User;
            submission.user = user;
            done(err);
          });
        },
        function (done) {
          _db.collection('assignments').findOne({'_id': submission.Assignment},
              assigProjections, function (err, assignment) {
            delete submission.Assignment;
            submission.assignment = assignment;
            done(err);
          });
        }
      ], forEachDone);
    }, function (err) {
      callback(err, submissions);
    });
  });
};

Submissions.prototype.findAssignmentSubmissions = function(assignId, callback) {
  var _db = this.db;

  var query = {
    'Assignment': new ObjectID(assignId)
  };

  var projections = {

  };

  this.collection.find(query, projections).toArray(function (err, submissions) {
    if (err) {
      return callback(err);
    }

    var userProjections = {'firstName':1, 'lastName': 1, 'email': 1};

    async.each(submissions, function (submission, forEachDone) {
      _db.collection('users').findOne({'_id': submission.User},
          userProjections, function (err, user) {
        delete submission.User;
        submission.user = user;
        forEachDone(err);
      });
    }, function (err) {
      callback(err, submissions);
    });
  });
};

module.exports = Submissions;