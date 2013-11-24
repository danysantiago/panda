/**
  assignments.js - DB controller for the assignments collection
**/

var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID,
    revalidator = require('revalidator'),
    async = require('async'),
    _ = require('underscore'),
    utils = require('../utils.js');

function Assignments(db) {
  this.db = db;
  this.collection = db.collection('assignments');
}

//Assignment Schema
var schema = {
  'properties': {
    'Course': {
      'type':'string',
      'pattern': utils.mongoObjectIdRegEx,
      'required': true
    },
    'TestCases': {
      'type': 'array'
    },
    'name': {
      'required': true,
      'type': 'string'
    },
    'shortDescription': {
      'type': 'string'
    },
    'totalScore': {
      'type': 'number'
    },
    'deadline': {
      'required': true,
      'type': 'string'
    },
    'numOfTries': {
      'required': true,
      'type': 'number'
    },
    'singleFileName': {
      'type': 'string'
    },
    'Instructions': {
      'type': 'object',
      'properties': {
        'file': {
          'type': 'object'
        },
        'text': {
          'type': 'string'
        }
      }
    }
  }
};

//Validate function of schema
Assignments.prototype.check = function(assignObj) {
  return revalidator.validate(assignObj, schema,
    {'validateFormatsStrict': true});
};

//Query assignment by its id
Assignments.prototype.findById =  function(id, callback) {
  var query = {
    '_id': new ObjectID(id),
    'deleted': false
  };

  var projections = {
    'deleted':0
  };

  this.collection.findOne(query, projections, function (err, assignment) {
    if (err) {
      return callback(err);
    }

    if(assignment) { //Reduce scores to have totalScore
      assignment.totalScore = _.reduce(assignment.TestCases, //totalScore
        function (memo, testCase) {
          return memo + testCase.score;
        }, 0);
    }

    callback(null, assignment);
  });
};
 
//Query a single assignment, query is given as function parameter
Assignments.prototype.findOne = function(query, callback) {
  query.deleted = false;

  var projections = {
    'deleted':0
  };

  this.collection.findOne(query, projections, callback);
};

//Query all assignments
Assignments.prototype.findAll = function(callback) {
  var query = {
    'deleted': false
  };

  this.collection.find(query).toArray(callback);
};

//Query all assignments a user (student or professor) is tied to.
Assignments.prototype.findUserAssigments = function(repositories, callback) {

  //Iterative implementation, possible bottleneck...?
  var assigsIds = _.map(repositories, function (item) { return item.assigId; });

  var query = {
    '_id': {$in: assigsIds},
    'deleted': false
  };

  var projections = {
    'Instructions': 0,
    'TestCases.resource': 0,
    'deleted': 0
  };

  this.collection.find(query, projections).toArray(callback);
};

//Query all assignments for a course
Assignments.prototype.findCourseAssignments = function(courseId, callback) {
  var _db = this.db;

  var query = {
    'Course': new ObjectID(courseId),
    'deleted': false
  };

  var projections = {
    'Instructions': 0,
    'TestCases.resource': 0,
    'deleted': 0
  };

  this.collection.find(query, projections).toArray(function (err, assignments) {
    if (err) {
      return callback(err);
    }
    //For each assignment get aggregated values
    async.each(assignments, function (assignment, done) {
      assignment.numOfTestCases = assignment.TestCases.length; //numOfTestCases
      assignment.totalScore = _.reduce(assignment.TestCases, //totalScore
        function (memo, testCase) {
          return memo + testCase.score;
        }, 0);
      delete assignment.TestCases; //We are done with testCases
      //numberOfSubmissions
      _db.collection('submissions').find({'Assignment': assignment._id})
        .count(function (err, count) {
          assignment.numOfSubmissions = count;
          done(err, count);
        }
      );

    }, function (err) {
      callback(err, assignments);
    });
  });
};

Assignments.prototype.findCourseAssignmentsSimple = function (courseId, callback) {
  var query = {
    'Course': new ObjectID(courseId),
    'deleted': false
  };

  var projections = {
    'Instructions': 0,
    'TestCases.resource': 0,
    'deleted': 0
  };

  this.collection.find(query, projections).toArray(callback);
}

//Insert an assignment doc into DB
Assignments.prototype.insert = function(assignObj, callback) {
  assignObj.Course = new ObjectID(assignObj.Course);
  assignObj.TestCases = [];
  assignObj.creationDate = new Date();
  assignObj.deleted = false;

  this.collection.insert(assignObj, callback);
};

Assignments.prototype.update = function(assignId, updatedFields, callback) {
  console.log(typeof callback);
  var query = {
    '_id': new ObjectID(assignId),
    'deleted': false
  };

  var update = {
    $set: updatedFields
  }
  
  this.collection.findAndModify(query, null, update, callback);
};

//Soft delete assignment doc from DB
Assignments.prototype.del = function(id, callback) {
  var query = {
    '_id': new ObjectID(id),
    'deleted': false
  };

  var update = {
    'deleted': true
  };
  
  this.collection.findAndModify(query, null, update, callback);
};

//Push a test case object into assignment
Assignments.prototype.insertTest = function(assignId, testCase, callback) {
  testCase._id = new ObjectID();

  var query = {
    '_id': new ObjectID(assignId)
  };

  var update = {
    $push: {'TestCases': testCase}
  };

  this.collection.findAndModify(query, null, update, callback);
};

//Remove a test case object from assignment
Assignments.prototype.removeTest = function(assignId, testId, callback) {
  var query = {
    '_id': new ObjectID(assignId)
  };

  var update = {
    $pull: {'TestCases': { '_id': new ObjectID(testId)}}
  };

  this.collection.findAndModify(query, null, update, callback);
};

module.exports = Assignments;