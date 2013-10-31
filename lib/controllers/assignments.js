var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID,
    revalidator = require('revalidator'),
    _ = require('underscore');

function Assignments(db) {
  this.db = db;
  this.collection = db.collection('assignments');
}

var schema = {
  'properties': {
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

  this.collection.findOne(query, projections, callback);
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
    'TestCases': 0,
    'deleted': 0
  };

  this.collection.find(query, projections).toArray(callback);
};

Assignments.prototype.findCourseAssignments = function(courseId, callback) {

  var query = {
    'Course': new ObjectID(courseId),
    'deleted': false
  };

  var projections = {
    'Instructions': 0,
    'TestCases': 0,
    'deleted': 0
  };

  this.collection.find(query, projections).toArray(callback);
};

Assignments.prototype.insert = function(assignObj, callback) {
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