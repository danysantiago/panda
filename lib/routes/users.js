var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

var Users = require('../controllers/users.js');

var Fakes = require('./fakes.js')

function getUsers (req, res, next) {
  log.info('wii');
  res.send(200, Fakes.getUsers());
}

function getUser (req, res, next) {
  res.send(200, Fakes.getUser(req.params.userId));
}

function createUser(req, res, next) {
  res.send(201);
}

function updateUser(req, res, next) {
  res.send(200);
}

function deleteUser(req, res, next) {
  res.send(200);
}

function getUserCourses(req, res, next) {
  res.send(200, Fakes.getUserCourses(req.params.userId));
}

function getUserAssignments(req, res, next) {
  res.send(200, Fakes.getUserAssignments(req.params.userId));
}

function getUserSubmissions(req, res, next) {
  res.send(200, Fakes.getUserSubmissions(req.params.userId));
}

var middleware = express();

middleware.use(function (req, res, next) {
  req.users = new Users(req.db);
  next();
});

middleware.get("/users", getUsers);
middleware.get("/users/:userId", getUser);
middleware.post("/users", express.bodyParser(), createUser);
middleware.put("/users/:userId", express.bodyParser(), createUser);
middleware.del("/users/:userId", createUser);
middleware.get("/users/:userId/courses", getUserCourses);
middleware.get("/users/:userId/assignments", getUserAssignments);
middleware.get("/users/:userId/submissions", getUserSubmissions);

module.exports = middleware;