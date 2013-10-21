var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

var Fakes = require('./fakes.js');
function getAssignments (req, res, next) {
  res.send(200, Fakes.getAssignments());
}

function getAssignment (req, res, next) {
  res.send(200, Fakes.getAssignment(req.params.assignmentId));
}

function createAssignment(req, res, next) {
  res.send(200);
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

var middleware = express();

middleware.use(function (req, res, next) {
  next();
});

middleware.get("/assignments", getAssignments);
middleware.get("/assignments/:assignmentId", getAssignment);
middleware.post("/assignments", express.bodyParser(), createAssignment);
middleware.put("/assignments/:assignmentId", express.bodyParser(), createAssignment);
middleware.del("/assignments/:assignmentId", createAssignment);
middleware.post("/assignments/:assignmentId/test", express.bodyParser(), createTestCase);
middleware.del("/assignments/:assignmentId/test/:testId", removeTestCase);

module.exports = middleware;