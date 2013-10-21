var mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID;

function Courses(db) {
  this.db = db;
  this.collection = db.collection('courses');
}

module.exports = Courses;