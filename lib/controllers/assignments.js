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
    'Instructions': {
      'type': 'object',
      'properties': {
        'file': {
          'type': 'string'
        },
        'text': {
          'type': 'string'
        }
      }
    }
  }
};

Assignments.prototype.check = function(assignObj) {
  return revalidator.validate(assignObj, schema, {'validateFormatsStrict': true});
};

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

    if(assignment) {
      assignment.totalScore = _.reduce(assignment.TestCases, //totalScore
        function (memo, testCase) {
          return memo + testCase.score;
      }, 0);
    }

    callback(null, assignment);
  });
};
 
Assignments.prototype.findOne = function(query, callback) {
  query.deleted = false;

  var projections = {
    'deleted':0
  };

  this.collection.findOne(query, projections, callback);
};

Assignments.prototype.findAll = function(callback) {
  var query = {
    'deleted': false
  };

  this.collection.find(query).toArray(callback);
};

Assignments.prototype.findUserAssigments = function(repositories, callback) {

  //Iterative implementation, possible bottleneck...?
  var assigsIds = _.map(repositories, function (item) { return item.id; });

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

Assignments.prototype.insert = function(assignObj, callback) {
  assignObj.Course = new ObjectID(assignObj.Course);
  assignObj.TestCases = [];
  assignObj.creationDate = new Date();
  assignObj.deleted = false;

  this.collection.insert(assignObj, callback);
};

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