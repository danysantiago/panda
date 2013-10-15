var config = require("../config.js"),
    express = require("express"),
    async = require("async");

var db;
var log;

var Fakes = require('./fakes.js')
function getUsers (req, res, next) {
  res.send(200);
}

function getUser (req, res, next) {
  var fakeUser = {
    "_id": "1234567890",
    "role": "student",
    "firstName": "Daniel",
    "lastName": "Santiago",
    "email": "daniel.santiago@upr.edu",
    "repository": [
      {
        "assignment._id": "1234567890",
        "path": "http://server.gitlab.com/daniel.santiago/assig1234567890"}
    ]
  };

  res.send(200, fakeUser);
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
  res.send(200, Fakes.getUserCourses);
}

function getUserAssignments(req, res, next) {
  res.send(200);
}

function getUserSubmissions(req, res, next) {
  res.send(200);
}

var users = express();

users.use(function (req, res, next) {
  log = req.log;
  db = req.db;
  next();
});

users.get("/users", getUsers);
users.get("/users/:userId", getUsers);
users.post("/users", express.bodyParser(), createUser);
users.put("/users/:userId", express.bodyParser(), createUser);
users.del("/users/:userId", createUser);
users.get("/users/:userId/courses", getUserCourses);
users.get("/users/:userId/assignments", getUserAssignments);
users.get("/users/:userId/submissions", getUserSubmissions);

module.exports = users;