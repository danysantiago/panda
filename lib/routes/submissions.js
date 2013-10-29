var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

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

var middleware = express();

middleware.use(function (req, res, next) {
  next();
});

middleware.get("/submissions", getSubmissions);
middleware.get("/submissions/:submissionId", getSubmission);
middleware.post("/submissions", express.bodyParser(), createSubmission);

module.exports = middleware;