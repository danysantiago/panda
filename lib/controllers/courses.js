var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID,
    revalidator = require('revalidator');

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
      'minLength': 4,
      'maxLength': 25,
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
    }
  }
  //TODO (Daniel): Missing grader nested property
};

Courses.prototype.check = function(courseObj) {
  return revalidator.validate(courseObj, schema, {'validateFormatsStrict': true});
};

Courses.prototype.findById =  function(id, callback) {
  this.collection.findOne({'_id': new ObjectID(id)}, {'deleted':0}, callback);
};
 
Courses.prototype.findOne = function(query, callback) {
  this.collection.findOne(query, {'deleted':0}, callback);
};

Courses.prototype.insert = function(courseObj, callback) {
  courseObj.Users = [];
  courseObj.Assignments = [];
  courseObj.deleted = false;
  this.collection.insert(courseObj, callback);
};

module.exports = Courses;