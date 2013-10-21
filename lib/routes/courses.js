var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

var Courses = require('../controllers/courses.js');

var Fakes = require('./fakes.js');

function getCourses (req, res, next) {
  res.send(200, Fakes.getCourses());
}

function getCourse (req, res, next) {
  res.send(200, Fakes.getCourse(req.params.courseId));
}

function createCourse(req, res, next) {
  res.send(201);
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

/**
 * Returns the assignment IDs that are linked to a course.
 * @param courseId
 */
function getCourseAssignments(req, res, next) {
  res.send(200, Fakes.getCourseAssignments(req.params.courseId));
}

function getCourseSubmissions(req, res, next) {
  res.send(200, Fakes.getCourseSubmissions(req.params.courseId));
}

var middleware = express();

middleware.use(function (req, res, next) {
  req,courses = new Courses(req.db);
  next();
});

middleware.get("/courses", getCourses);
middleware.get("/courses/:courseId", getCourse);
middleware.post("/courses", express.bodyParser(), createCourse);
middleware.put("/courses/:courseId", express.bodyParser(), createCourse);
middleware.del("/courses/:courseId", createCourse);
middleware.get("/courses/:courseId/users", getCourseUsers);
middleware.post("/courses/:courseId/users/:userId", express.bodyParser(), addUser);
middleware.del("/courses/:courseId/users/:userId", removeUser);
middleware.get("/courses/:courseId/assignments", getCourseAssignments);
middleware.get("/courses/:courseId/submissions", getCourseSubmissions);

module.exports = middleware;