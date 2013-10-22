var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

var Courses = require('../controllers/courses.js');

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
  req.courses.findById(courseId, function (err, course) {
    if (err) {
      return next(err);
    }

    if(!course) {
      res.send(404, {'error': 'Course not found'});
      return;
    }

    res.send(200, course);
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

var middleware = express();

middleware.use(function (req, res, next) {
  req.courses = new Courses(req.db);
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

module.exports = middleware;