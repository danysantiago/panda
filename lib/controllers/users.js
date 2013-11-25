/**
  users.js - DB controller for the users collection
**/

var config = require('../config/config.js'),
    mongodb = require('mongodb'),
    ObjectID = mongodb.ObjectID,
    revalidator = require('revalidator'),
    crypto = require('crypto'),
    async = require('async'),
    _ = require('underscore');

function Users(db) {
  this.db = db;
  this.collection = db.collection('users');
}

//User schema
var schema = {
  'properties': {
    'role': {
      'required': true,
      'type': 'string',
      'pattern': /student|professor|admin/i,
      'messages': {
        'pattern': 'must be either student, professor or admin'
      }
    },
    'email': {
      'required': true,
      'type': 'string',
      'format': 'email'
    },
    'password': {
      'required': true,
      'type': 'string',
      'minLength': 4,
      'maxLength': 25,
    },
    'firstName': {
      'required': true,
      'type': 'string',
      'minLength': 2,
      'maxLength': 25,
    },
    'lastName': {
      'required': true,
      'type': 'string',
      'minLength': 2,
      'maxLength': 25,
    }
  }
};

//Salt function for password encrypting
function makeSalt() {
  return Math.round((new Date().valueOf() * Math.random())) + '';
}

//Encrypt password function, requires a salt
function encryptPassword(password, salt) {
  if(config.env === 'development') { //Skip password encrypt in dev mode
    return password;
  }

  return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

//Validate function of schema
Users.prototype.check = function(userObj) {
  return revalidator.validate(userObj, schema,
    {'validateFormatsStrict': true});
};

//Query a user by its id
Users.prototype.findById =  function(id, callback) {
  var query = {
    '_id': new ObjectID(id),
    'deleted': false
  };

  var projections = {'deleted':0, 'salt': 0};

  this.collection.findOne(query, projections, callback);
};
 
//Query a single user, query is given to function as parameter
Users.prototype.findOne = function(query, callback) {
  query.deleted = false;

  var projections = {'deleted':0};

  this.collection.findOne(query, projections, callback);
};

//Query all users
Users.prototype.findAll = function(callback) {
  var query = {'deleted': false};

  var projections = {'deleted':0, 'salt': 0};

  this.collection.find(query, projections).toArray(callback);
};

//Query all users within a list of users ids
Users.prototype.findAllIn = function(userIdsArr, callback) {
  var query = {
    '_id': {$in: userIdsArr},
    'deleted': false
  };

  var projections = {'deleted':0, 'salt': 0, 'Repositories': 0};

  this.collection.find(query, projections).toArray(callback);
};

//Query students and aggregations given a course
Users.prototype.findStudents = function(courseObj, callback) {
  var _db = this.db;

  var query = {
    '_id': {$in: courseObj.Users},
    'deleted': false
  };

  var projections = {'deleted':0, 'salt': 0, 'Repositories': 0};

  var subP = {'Assignment': 1, 'score': 1, 'totalScore': 1, 'finalVerdict': 1};

  this.collection.find(query, projections).toArray(function (err, students) {
    if (err) {
      return callback(err);
    }

    async.each(students, function (student, forEachDone) {
      async.waterfall([

        function (done) { //Get distinct assignment ids, to calculate grades
          _db.collection('assignments').distinct('_id',
            {'Course': courseObj._id}, done);
        },

        function (assignmentsIds, done) {
          student.grades = []; //Grades array of student
          async.eachSeries(assignmentsIds, function (assigId, _done) {
            var subQ = {
              'User': student._id,
              'Course': courseObj._id,
              'Assignment': assigId
            };
            //We look for the last submission, that is his grade
            _db.collection('submissions').find(subQ, subP).sort({'_id':-1})
                .limit(1).toArray(function (err, submission) {
              if (err) {
                return _done(err);
              }

              if(submission.length === 1) { //Push grade
                student.grades.push(submission[0]);
              }

              _done();
            });
          }, done);
        }

      ], forEachDone);
    }, function (err) {
      callback(err, students);
    });

  });
};

//Query all graders (Professors, TAs) given a set of ids
Users.prototype.findGraders = function(graders, callback) {
  //Iterative implementation, possible bottleneck...?
  var gradersIds = _.map(graders, function (item) { return item.id; });

  var query = {
    '_id': {$in: gradersIds},
    'deleted': false
  };

  var projections = {'deleted':0, 'salt': 0, 'Repositories': 0};

  this.collection.find(query, projections).toArray(callback);
};

//Query all graders (Professors, TAs) given a set of ids
Users.prototype.findStudentsSimple = function(studentsIds, callback) {
  var query = {
    '_id': {$in: studentsIds},
    'deleted': false
  };

  var projections = {'deleted':0, 'salt': 0, 'Repositories': 0};

  this.collection.find(query, projections).toArray(callback);
};

//Insert user doc into DB
Users.prototype.insert = function(userObj, callback) {
  userObj.deleted = false;
  userObj.salt = makeSalt();
  userObj.password = encryptPassword(userObj.password, userObj.salt);

  this.collection.insert(userObj, callback);
};

Users.prototype.update = function(userId, updatedFields, callback) {
  var query = {
    '_id': new ObjectID(userId),
    'deleted': false
  };

  if (updatedFields.password) {
    updatedFields.salt = makeSalt();
    updatedFields.password = encryptPassword(updatedFields.password,
      updatedFields.salt);
  }

  var update = {
    $set: updatedFields
  };
  
  this.collection.findAndModify(query, null, update, callback);
};

//Soft delete user from DB
Users.prototype.del = function(id, callback) {
  var query = {
    '_id': new ObjectID(id),
    'deleted': false
  };

  var update = {
    'deleted': true
  };
  
  this.collection.findAndModify(query, null, update, callback);
};

//Check password function
Users.prototype.checkPassword = function(user, password) {
  if(config.env === 'development') { //Skip password encrypt in dev mode
    return user.password === password;
  }

  return user.password === encryptPassword(password, user.salt);
};

Users.prototype.insertRepo = function(userId, repoInfo, callback) {
  var query = {
    '_id': userId //No need to use ObjectID, internal use
  };

  var update;

  //Allos for pushing either a single repo, of various repos
  if(repoInfo instanceof Array) {
    update = { $push: { 'Repositories': { $each: repoInfo } } };
  } else {
    update = { $push: { 'Repositories': repoInfo} };
  }


  this.collection.update(query, update, callback);
};


module.exports = Users;