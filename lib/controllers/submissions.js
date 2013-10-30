var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID,
    revalidator = require('revalidator');

function Submissions(db) {
  this.db = db;
  this.collection = db.collection('submissions');
}

function isObjectID(v) {
  try {
    new ObjectID(v);
  } catch (err) {
    return false;
  }

  return true;
}

var schema = {
  'properties': {
    'User': {
      'type': 'string',
      'required': true,
      'conform': isObjectID
    },
    'Assignment': {
      'type': 'string',
      'required': true,
      'conform': isObjectID
    }
  }
};

Submissions.prototype.check = function(subObj) {
  return revalidator.validate(subObj, schema, {'validateFormatsStrict': true});
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
  var query = {
    'Course': new ObjectID(courseId)
  };

  var projections = {

  };

  this.collection.find(query, projections).toArray(callback);
};

Submissions.prototype.findAssignmentSubmissions = function(assignId, callback) {
  var query = {
    'Assignment': new ObjectID(assignId)
  };

  var projections = {

  };

  this.collection.find(query, projections).toArray(callback);
}

module.exports = Submissions;