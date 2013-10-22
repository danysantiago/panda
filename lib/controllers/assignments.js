var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID,
    revalidator = require('revalidator');

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
    'instructions': {
      'require': true,
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
  this.collection.findOne({'_id': new ObjectID(id)}, {'deleted':0}, callback);
};
 
Assignments.prototype.findOne = function(query, callback) {
  this.collection.findOne(query, {'deleted':0}, callback);
};

Assignments.prototype.findAll = function(callback) {
  this.collection.find().toArray(callback);
};

Assignments.prototype.insert = function(assignObj, callback) {
  assignObj.deleted = false;
  this.collection.insert(assignObj, callback);
};

module.exports = Assignments;