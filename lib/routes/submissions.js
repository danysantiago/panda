var config = require("../config.js"),
    express = require("express"),
    async = require("async");

var db;
var log;

var Fakes = require("./fakes.js");
function getSubmissions (req, res, next) {
  res.send(200, Fakes.getSubmissions());
}

function getSubmission (req, res, next) {
  res.send(200, Fakes.getSubmission(req.params.submissionId));
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
submissions.get("/submissions/:submissionId", getSubmission);
submissions.post("/submissions", express.bodyParser(), createSubmission);

module.exports = submissions;