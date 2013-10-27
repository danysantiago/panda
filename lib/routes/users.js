var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

var Users = require('../controllers/users.js');
var Courses = require('../controllers/courses.js');
var Assignments = require('../controllers/assignments.js');
var Submissions = require('../controllers/submissions.js');

var Fakes = require('./fakes.js');

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
    courses - boolean - Result contains user courses
    assignments - boolean - Result contains user assignments
    submissions - boolean - Result contains user submissions
*/
function getUser (req, res, next) {
  var userId = req.params.userId;
  var result; //Response payload

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
      if(req.query.courses === "true") {
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
      if(req.query.assignments === "true") {
        //Query all assignments that match any of the assignments ids in the users
        //repositories array
        req.assignments.findUserAssigments(result.repositories, function (err, assignments) {
          result.assignments = assignments; //Set assignments array for response
          callback(err);
        });
      } else {
        callback();
      }
    },

    function (callback) {
      if(req.query.submissions === "true") {
        //Query all submissions that contain the user id
        req.submissions.findUserSubmissions(userId, function (err, submissions) {
          result.submissions = submissions; //Set assignments array for response
          callback(err);
        });
      } else {
        callback();
      }
    }
    
  ], function (err, courses) {
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
      //Insert new user into DB
      req.users.insert(userObj, callback);
    }

  ], function (err, user) {
    if (err) {
      return next(err);
    }

    //TODO (Daniel): Should not return new user doc
    res.send(201, user);
  });

}

function updateUser(req, res, next) {
  res.send(200);
}

function deleteUser(req, res, next) {
  //Soft deletes a user by tis userId
  var userId = req.params.userId;
  req.users.del(userId, function (err, result) {
    if (err) {
      return next(result);
    }

    //If the findAndModify doesn't return old user it was never there
    if(!result) { 
      res.send(404, {'error': 'User not found'});
      return;
    }

    //TODO (Daniel): Should not return deleted doc
    res.send(200, result);
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
middleware.get("/users", getUsers);
middleware.get("/users/:userId", getUser);
middleware.post("/users", express.bodyParser(), createUser);
middleware.put("/users/:userId", express.bodyParser(), updateUser);
middleware.del("/users/:userId", deleteUser);
//middleware.get("/users/:userId/courses", getUserCourses);
//middleware.get("/users/:userId/assignments", getUserAssignments);
//middleware.get("/users/:userId/submissions", getUserSubmissions);

module.exports = middleware;