var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

var db;
var log;

/*
 * var fakeUser = {
    "_id": "1234567890",
    "role": "student",
    "firstName": "Daniel",
    "lastName": "Santiago",
    "email": "daniel.santiago@upr.edu",
    "repository": [
      {
        "assignment._id": "1234567890",
        "path": "http://pandagitlab.sytes.net/danysantiago/pandajavasnippets.git"}
    ]
  };
*/
var Fakes = require('./fakes.js')

function getUsers (req, res, next) {
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

var users = express();

users.use(function (req, res, next) {
  log = req.log;
  db = req.db;
  next();
});

users.get("/users", getUsers);
users.get("/users/:userId", getUser);
users.post("/users", express.bodyParser(), createUser);
users.put("/users/:userId", express.bodyParser(), createUser);
users.del("/users/:userId", createUser);
users.get("/users/:userId/courses", getUserCourses);
users.get("/users/:userId/assignments", getUserAssignments);
users.get("/users/:userId/submissions", getUserSubmissions);

module.exports = users;