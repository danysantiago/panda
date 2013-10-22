var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

var Assignments = require('../controllers/assignments.js');

var Fakes = require('./fakes.js');

function getAssignments (req, res, next) {
  req.assignments.findAll(function (err, assignments) {
    if (err) {
      return next(err);
    }

    res.send(200, assignments);
  });
}

function getAssignment (req, res, next) {
  var assignId = req.params.assignId;
  req.assignments.findById(assignId, function (err, assign) {
    if (err) {
      return next(err);
    }

    if(!assign) {
      res.send(404, {'error': 'Assignment not found'});
      return;
    }

    res.send(200, assign);
  });
}

function createAssignment(req, res, next) {
  var assignObj = req.body;
  var val = req.assignments.check(assignObj);
  if(!val.valid) {
    res.send(400, val.errors);
    return;
  }

  req.assignments.insert(assignObj, function (err, assign) {
    if (err) {
      return next(err);
    }

    res.send(201, assign);
  });
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
  req.assignments = new Assignments(req.db);
  next();
});

middleware.get("/assignments", getAssignments);
middleware.get("/assignments/:assignId", getAssignment);
middleware.post("/assignments", express.bodyParser(), createAssignment);
middleware.put("/assignments/:assignId", express.bodyParser(), createAssignment);
middleware.del("/assignments/:assignId", createAssignment);
middleware.post("/assignments/:assignId/test", express.bodyParser(), createTestCase);
middleware.del("/assignments/:assignId/test/:testId", removeTestCase);

module.exports = middleware;