var config = require("../config.js"),
    express = require("express"),
    async = require("async");

var db;
var log;

function getAssignments (req, res, next) {
  res.send(200);
}

function getAssignment (req, res, next) {
  res.send(200);
}

function createAssignment(req, res, next) {
  res.send(201);
}

function updateAssignment(req, res, next) {
  res.send(200);
}

function deleteAssignment(req, res, next) {
  res.send(200);
}

function createTestCase(req, res, next) {
  res.send(200);
}

function removeTestCase(req, res, next) {
  res.send(200);
}

var assignments = express();

assignments.use(function (req, res, next) {
  log = req.log;
  db = req.db;
  next();
});

assignments.get("/assignments", getAssignments);
assignments.get("/assignments/:assignmentId", getAssignments);
assignments.post("/assignments", express.bodyParser(), createAssignment);
assignments.put("/assignments/:assignmentId", express.bodyParser(), createAssignment);
assignments.del("/assignments/:assignmentId", createAssignment);
assignments.post("/assignments/:assignmentId/test", express.bodyParser(), createTestCase);
assignments.del("/assignments/:assignmentId/test/:testId", removeTestCase);

module.exports = assignments;