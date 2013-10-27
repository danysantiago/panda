var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID,
    revalidator = require('revalidator');

function Submissions(db) {
  this.db = db;
  this.collection = db.collection('submissions');
}

var schema = {
  'properties': {
  }
};

Submissions.prototype.check = function(subObj) {
  return revalidator.validate(subObj, schema, {'validateFormatsStrict': true});
};

Submissions.prototype.findById =  function(id, callback) {

};
 
Submissions.prototype.findOne = function(query, callback) {

};

Submissions.prototype.findAll = function(callback) {

};

Submissions.prototype.findUserSubmissions = function(userId, callback) {
  var query = {
    "User": new ObjectID(userId)
  };

  var projections = {

  };

  this.collection.find(query, projections).toArray(callback);
}

module.exports = Submissions;