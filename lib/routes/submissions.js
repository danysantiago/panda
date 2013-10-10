var config = require("../config.js"),
    express = require("express"),
    async = require("async");

var db;
var log;

function getSubmissions (req, res, next) {
  res.send(200);
}

function getSubmission (req, res, next) {
  res.send(200);
}

function createSubmission(req, res, next) {
  res.send(201);
}

var submissions = express();

submissions.use(function (req, res, next) {
  log = req.log;
  db = req.db;
  next();
});

submissions.get("/submissions", getSubmissions);
submissions.get("/submissions/:submissionId", getSubmissions);
submissions.post("/submissions", express.bodyParser(), createSubmission);

module.exports = submissions;