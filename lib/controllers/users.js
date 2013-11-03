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

var schema = {
  'properties': {
    'role': {
      'required': true,
      'type': 'string',
      'pattern': /student|professor/i,
      'messages': {
        'pattern': 'must be either student or professor'
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

function makeSalt() {
  return Math.round((new Date().valueOf() * Math.random())) + '';
}

function encryptPassword(password, salt) {
  if(config.env === 'development') { //Skip password encrypt in dev mode
    return password;
  }

  return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

Users.prototype.check = function(userObj) {
  return revalidator.validate(userObj, schema, {'validateFormatsStrict': true});
};

Users.prototype.findById =  function(id, callback) {
  var query = {
    '_id': new ObjectID(id),
    'deleted': false
  };

  var projections = {'deleted':0, 'salt': 0};

  this.collection.findOne(query, projections, callback);
};
 
Users.prototype.findOne = function(query, callback) {
  query.deleted = false;

  var projections = {'deleted':0};

  this.collection.findOne(query, projections, callback);
};

Users.prototype.findAll = function(callback) {
  var query = {'deleted': false};

  var projections = {'deleted':0, 'salt': 0};

  this.collection.find(query, projections).toArray(callback);
};

Users.prototype.findAllIn = function(userIdsArr, callback) {
  var query = {
    '_id': {$in: userIdsArr},
    'deleted': false
  };

  var projections = {'deleted':0, 'salt': 0, 'Repositories': 0};

  this.collection.find(query, projections).toArray(callback);
};

Users.prototype.findAllIn = function(userIdsArr, callback) {
  var query = {
    '_id': {$in: userIdsArr},
    'deleted': false
  };

  var projections = {'deleted':0, 'salt': 0, 'Repositories': 0};

  this.collection.find(query, projections).toArray(callback);
};

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

        function (done) {
          _db.collection('assignments').distinct('_id',
            {'Course': courseObj._id}, done);
        },

        function (assignmentsIds, done) {
          student.grades = [];
          async.eachSeries(assignmentsIds, function (assigId, _done) {
            var subQ = {
              'User': student._id,
              'Course': courseObj._id,
              'Assignment': assigId
            };
            _db.collection('submissions').find(subQ, subP).sort({'_id':-1})
                .limit(1).toArray(function (err, submission) {
              if (err) {
                return _done(err);
              }

              if(submission.length === 1) {
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

Users.prototype.insert = function(userObj, callback) {
  userObj.deleted = false;
  userObj.salt = makeSalt();
  userObj.password = encryptPassword(userObj.password, userObj.salt);

  this.collection.insert(userObj, callback);
};

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

Users.prototype.checkPassword = function(user, password) {
  if(config.env === 'development') { //Skip password encrypt in dev mode
    return user.password === password;
  }

  return user.password === encryptPassword(password, user.salt);
};


module.exports = Users;