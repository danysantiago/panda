var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

var Users = require('../controllers/users.js');
var Courses = require('../controllers/courses.js');
var Assignments = require('../controllers/assignments.js');
var Submissions = require('../controllers/submissions.js');

var Fakes = require('./fakes.js');

function getCourses (req, res, next) {
  req.courses.findAll(function (err, courses) {
    if (err) {
      return next(err);
    }

    res.send(200, courses);
  });
}

function getCourse (req, res, next) {
  var courseId = req.params.courseId;
  var result; //Response payload

  async.waterfall([

    function (callback) { //Query course by its courseId
      req.courses.findById(courseId, callback);
    },

    function (course, callback) {
      if (!course) { //No course object, it was not found in db
        res.send(404, {'error': 'Course not found'});
        return;
      }

      result = course; //User object is response

      callback();
    },

    function (callback) {
      if(req.query.users === "true") {
        //Query all users that match any of the users ids in the Users array
        //of the course
        req.users.findAllIn(result.Users, function (err, users) {
          result.users = users; //Set users array for response
          callback(err);
        });
      } else {
        callback();
      }
    },

      function (callback) {
      if(req.query.assignments === "true") {
        //Query all assignments that match any of the assignments ids in the
        //Assignments array of the course
        req.assignments.findAllIn(result.Assignments, function (err, assignments) {
          result.assignments = assignments; //Set assignments array for response
          callback(err);
        });
      } else {
        callback();
      }
    },

    function (callback) {
      if(req.query.submissions === "true") {
        //Query all submissions that has as assigment any of the assigments in the
        //assignments array of the course
        req.submissions.findCourseSubmissions(result.Assignments, function (err, submissions) {
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

function createCourse(req, res, next) {
  var courseObj = req.body;
  var val = req.courses.check(courseObj);
  if(!val.valid) {
    res.send(400, val.errors);
    return;
  }

  req.courses.insert(courseObj, function (err, course) {
    if (err) {
      return next(err);
    }

    res.send(201, course);
  });
}

function updateCourse(req, res, next) {
  res.send(200);
}

function deleteCourse(req, res, next) {
  res.send(200);
}

function getCourseUsers(req, res, next) {
  res.send(200, Fakes.getCourseUsers(req.params.courseId));
}

function addUser(req, res, next) {
  res.send(200);
}

function removeUser(req, res, next) {
  res.send(200);
}

function getCourseAssignments(req, res, next) {
  res.send(200, Fakes.getCourseAssignments(req.params.courseId));
}

function getCourseSubmissions(req, res, next) {
  res.send(200, Fakes.getCourseSubmissions(req.params.courseId));
}

function getHomeData(req, res, next) {
  res.send(200, {'courses': 3, 'pendingAssignments': 4, 'pastSubmissions': 2});
}

var middleware = express();

middleware.use(function (req, res, next) {
  //Init controllers for routes
  req.users = new Users(req.db);
  req.courses = new Courses(req.db);
  req.assignments = new Assignments(req.db);
  req.submissions = new Submissions(req.db);
  next();
});

middleware.get("/courses", getCourses);
middleware.get("/courses/:courseId", getCourse);
middleware.post("/courses", express.bodyParser(), createCourse);
middleware.put("/courses/:courseId", express.bodyParser(), updateCourse);
middleware.del("/courses/:courseId", deleteCourse);
middleware.get("/courses/:courseId/users", getCourseUsers);
middleware.post("/courses/:courseId/users/:userId", express.bodyParser(), addUser);
middleware.del("/courses/:courseId/users/:userId", removeUser);
middleware.get("/courses/:courseId/assignments", getCourseAssignments);
middleware.get("/courses/:courseId/submissions", getCourseSubmissions);
middleware.get("/home", getHomeData);

module.exports = middleware;