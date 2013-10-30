var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

var Submissions = require('../controllers/submissions.js');

var Queue = require('../queue.js');

function getSubmissions (req, res, next) {
  req.submissions.findAll(function (err, submissions) {
    if (err) {
      return next(err);
    }

    res.send(200, submissions);
  });
}

function getSubmission (req, res, next) {
  var submissionId = req.params.submissionId;

  req.submissions.findById(submissionId, function (err, submission) {
    if(err) {
      return next(err);
    }

    if(!submission) {
      res.send(404, {'error': 'Submission not found'});
      return;
    }

    res.send(200, submission);
  });
}

function createSubmission(req, res, next) {
  var submissionObj = req.body;

  //Validate payload
  var val = req.submissions.check(submissionObj);
  if(!val.valid) {
    res.send(400, val.errors);
    return;
  }

  /**********
    TODO (Daniel): In here we get the user and the assignment info necessary to
    get the repo's latest hash commit and zip file. We also check, that the
    user exists and it has the assignment on him, and that the assignment
    exists.
  **********/

  async.waterfall([
    function (callback) {
      //Get assignment, check if he exists
    },

    function (callback) {
      //Get User and get the repoPath, user must exist and must have path
    },

    function (callback) {
      Queue.push(submissionObj);
      callback();
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
    
    res.send(201);
  });

}

var middleware = express();

middleware.use(function (req, res, next) {
  req.submissions = new Submissions(req.db);
  next();
});

middleware.get("/submissions", getSubmissions);
middleware.get("/submissions/:submissionId", getSubmission);
middleware.post("/submissions", express.bodyParser(), createSubmission);

module.exports = middleware;