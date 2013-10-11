var config = require("../config.js"),
    express = require("express"),
    async = require("async");

var db;
var log;

function getCourses (req, res, next) {
  res.send(200);
}

function getCourse (req, res, next) {
  res.send(200);
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
  res.send(200);
}

function addUser(req, res, next) {
  res.send(200);
}

function removeUser(req, res, next) {
  res.send(200);
}

function getCourseAssignments(req, res, next) {
  res.send(200);
}

function getCourseSubmissions(req, res, next) {
  res.send(200);
}

var courses = express();

courses.use(function (req, res, next) {
  log = req.log;
  db = req.db;
  next();
});

courses.get("/courses", getCourses);
courses.get("/courses/:courseId", getCourse);
courses.post("/courses", express.bodyParser(), createCourse);
courses.put("/courses/:courseId", express.bodyParser(), createCourse);
courses.del("/courses/:courseId", createCourse);
courses.get("/courses/:courseId/users", getCourseUsers);
courses.post("/courses/:courseId/users/:userId", express.bodyParser(), addUser);
courses.del("/courses/:courseId/users/:userId", removeUser);
courses.get("/courses/:courseId/assignments", getCourseAssignments);
courses.get("/courses/:courseId/submissions", getCourseSubmissions);

module.exports = courses;