/**
  users.js - Contains route logistics for this resource
**/

var config = require('../config/config.js'),
    express = require('express'),
    async = require('async'),
    utils = require('../utils.js');

var Users = require('../controllers/users.js');
var Courses = require('../controllers/courses.js');
var Assignments = require('../controllers/assignments.js');
var Submissions = require('../controllers/submissions.js');

var Gitlab = require('../gitlab/Gitlab');

//SendGrid module, we are using Yamil's account ;) (Thanks gordito)
var sendgrid = require('sendgrid')('elbuo', '050505');

function getUsers (req, res, next) {
  //Gets ALL users from db in an array
  req.users.findAll(function (err, users) {
    if (err) {
      return next(err);
    }

    res.send(200, users);
  });
}

/*
  Gets User Data Route
  Url: /api/users/:userId
  Query Params:
    courses - boolean - Result contains user's courses
    assignments - boolean - Result contains user's assignments
    submissions - boolean - Result contains user's submissions
*/
function getUser (req, res, next) {
  var userId = req.params.userId;
  var result; //Response payload

  if (!utils.checkObjectId(userId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  async.waterfall([

    function (callback) { //Query user by its userId
      req.users.findById(userId, callback);
    },

    function (user, callback) {
      if (!user) { //No user object, it was not found in db
        res.send(404, {'error': 'User not found'});
        return;
      }

      result = user; //User object is response

      callback();
    },

    function (callback) {
      if(req.query.courses === 'true') {
        //Query all courses that contain the userId as an element in the Users
        //array of the course
        req.courses.findUserCourses(userId, function (err, courses) {
          result.courses = courses; //Set courses array for response
          callback(err);
        });
      } else {
        callback();
      }
    },

    function (callback) {
      if(req.query.assignments === 'true') {
        //Query all assignments that match any of the assignments ids in the
        //users repositories array
        req.assignments.findUserAssigments(result.Repositories,
            function (err, assignments) {
          result.assignments = assignments; //Set assignments array for response
          callback(err);
        });
      } else {
        callback();
      }
    },

    function (callback) {
      if(req.query.submissions === 'true') {
        //Query all submissions that contain the user id
        req.submissions.findUserSubmissions(userId,
            function (err, submissions) {
          result.submissions = submissions; //Set assignments array for response
          callback(err);
        });
      } else {
        callback();
      }
    }
    
  ], function (err) {
    if (err) {
      return next(err);
    }

    res.send(200, result);
  });
}

function createUser(req, res, next) {
  //Creates an user

  //Validate payload
  var userObj = req.body;
  var val = req.users.check(userObj);
  if(!val.valid) {
    res.send(400, val.errors);
    return;
  }

  async.waterfall([

    function (callback) { //Query DB for a user with same email
      req.users.findOne({'email': userObj.email}, callback);
    },

    function (user, callback) {
      if(user) { //If query returns user, email is taken
        res.send(400, {'error': 'Email already taken'});
        return;
      }

      //Create gitlab user
      var gitlab = new Gitlab(req.log);

      var gitlabUser = {
        'email': userObj.email,
        'password': userObj.password,
        'username': utils.emailToUsername(userObj.email),
        'name': userObj.firstName + ' ' + userObj.lastName,
        'projects_limit': 25
      };

      gitlab.user.create(gitlabUser, callback);
      
    },

    function (gitRes, gitBody, callback) {
      //Should we hold off if we can't create repo user?
      if (gitRes && gitRes.statusCode === 201) {
        userObj.gitId = gitBody.id;
      } else {
        userObj.gitId = null;
        req.log.error('Error creating Gitlab repo for user.');
      }

      req.users.insert(userObj, callback);
    }

  ], function (err, user) {
    if (err) {
      return next(err);
    }

    //TODO (Daniel): Should not return new user doc
    res.send(201, user[0]);

  });

}

function updateUser(req, res, next) {
  var userId = req.params.userId;

  if (!utils.checkObjectId(userId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  async.waterfall([

    function (callback) {
      req.users.update(userId, req.body, callback);
    },

    function (user, updateReport, callback) {
      console.log(user);
      console.log(callback);
      if(!user) { 
        res.send(404, {'error': 'User not found'});
        return;
      }

      //Update gitlab password
      var gitlab = new Gitlab(req.log);

      var gitlabUser = {
        'id': user.gitId,
        'password': req.body.password,
      };

      gitlab.user.modify(gitlabUser, callback);
    },

    function (gitRes, gitBody, callback) {
      if (gitRes && gitRes.statusCode === 200) {
        callback();
      } else {
        res.send(gitRes.statusCode, gitBody);
      }
    }

  ], function (err) {
    if (err) {
      return next(err);
    }

    res.send(200);
  });
}

function deleteUser(req, res, next) {
  var userId = req.params.userId;

  if (!utils.checkObjectId(userId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  if(req.user.role.toLowerCase() !== 'admin') {
    res.send(401, {'error': 'Unauthorized user to delete accounts'});
    return;
  }

  async.waterfall([

    //Get user to be deleted
    function (callback) {
      req.users.findById(userId, callback);
    },

    //Delete user from gitlab
    function (user, callback) {
      if (!user) {
        res.send(404, {'error': 'User not found'});
        return;
      }

      var gitlab = new Gitlab(req.log);

      var gitlabUser = {
        'id': user.gitId,
      };

      gitlab.user.delete(gitlabUser, callback);
    },

    //Remove him from all courses
    function (gitRes, gitBody, callback) {
      if (gitRes && gitRes.statusCode === 200) {
        callback();
      } else {
        req.log.warn('Error deleting gitlab account.');
      }
    },

    function (callback) {
      req.courses.removeUserAllCourses(userId, callback);
    },

    //Delete all his submissions
    function (updateInfo, callback) {
      req.submissions.removeUserSubmissions(userId, callback);
    },

    function (removeInfo, callback) {
      req.users.del(userId, callback);
    }

  ], function (err) {
    if (err) {
      return next(err);
    }

    res.send(200);
  });

}

function sendEmail(req, res, next) {
  var userId = req.params.userId;
  var receiverUserId = req.params.receiverUserId;

  if (!utils.checkObjectId(userId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  if (!utils.checkObjectId(receiverUserId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  if (!req.body.message) {
    res.send(400, {'error': 'Invalid message'});
    return;
  }

  var student;
  var professor;

  async.waterfall([

    function (callback) {
      req.users.findById(userId, callback);
    },

    function (user, callback) {
      if(!user) {
        res.send(404, {'error': 'User not found'});
        return;
      }

      student = user;
      callback();
    },

    function (callback) {
      req.users.findById(receiverUserId, callback);
    },

    function (user, callback) {
      if(!user) {
        res.send(404, {'error': 'Receiver User not found'});
        return;
      }

      professor = user;
      callback();
    },

    function (callback) {
      var params = {
        'to': professor.email,
        'from': student.email,
        'fromname': student.firstName + ' ' + student.lastName,
        'subject': 'Question about ' + req.body.assignmentName,
        'text': req.body.message
      };

      req.log.debug(params);

      sendgrid.send(params, callback); 
    }

  ], function (err, json) {
    if (err) {
      next(err);
      return;
    }

    req.log.debug(json);

    res.send(200);
  });

}

//function getUserCourses(req, res, next) {}

//function getUserAssignments(req, res, next) {}

//function getUserSubmissions(req, res, next) {}

var middleware = express();

middleware.use(function (req, res, next) {
  //Init controllers for routes
  req.users = new Users(req.db);
  req.courses = new Courses(req.db);
  req.assignments = new Assignments(req.db);
  req.submissions = new Submissions(req.db);
  next();
});

//Routes definitions
middleware.get('/users', getUsers);
middleware.get('/users/:userId', getUser);
middleware.post('/users', express.bodyParser(), createUser);
middleware.put('/users/:userId', express.bodyParser(), updateUser);
middleware.del('/users/:userId', deleteUser);
middleware.post('/users/:userId/to/:receiverUserId', express.bodyParser(),
  sendEmail);
//middleware.get('/users/:userId/courses', getUserCourses);
//middleware.get('/users/:userId/assignments', getUserAssignments);
//middleware.get('/users/:userId/submissions', getUserSubmissions);

module.exports = middleware;