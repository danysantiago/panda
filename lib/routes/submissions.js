/**
  submissions.js - Contains route logistics for this resource
**/

var config = require('../config/config.js'),
    express = require('express'),
    async = require('async'),
    utils = require('../utils.js'),
    _ = require('underscore');

var Users = require('../controllers/users.js');
var Assignments = require('../controllers/assignments.js');
var Submissions = require('../controllers/submissions.js');

var Queue = require('../queue.js');

var sendgrid = require('sendgrid')('elbuo', '050505');

var sockets = require('../models/sockets.js');

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

  if (!utils.checkObjectId(submissionId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

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

  async.waterfall([
    function (callback) {
      req.assignments.findById(submissionObj.Assignment, function (err, assig) {
        if (err) {
          return callback(err);
        }

        if(!assig) {
          res.send(400, {'error': 'Assignment not found.'});
          return;
        }

        submissionObj.Course = assig.Course;
        submissionObj.Assignment = assig._id;
        submissionObj.assignment = assig;
        callback();
      });
    },

    function (callback) {
      req.users.findById(submissionObj.User, function (err, user) {
        if (err) {
          return callback(err);
        }

        if(!user) {
          res.send(400, {'error': 'User not found.'});
          return;
        }

        var repository = _.find(user.Repositories, function (repo) {
          return repo.assigId.toString() === submissionObj.Assignment.toString();
        });

        if(!repository) {
          res.send(400, {'error': 'User does not contain assignment repo'});
          return;
        }

        delete user.Repositories;
        submissionObj.User = user._id;
        submissionObj.user = user;
        submissionObj.repo = repository;

        callback();
      });
    },

    function (callback) {
      Queue.push(submissionObj, function (results) {
        sockets.getIO().sockets.emit('submission', results);
        req.log.debug(results);
      });
      callback();
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
    
    res.send(201);
  });

}

function changeScore(req, res, next) {
  var submissionId = req.params.submissionId;

  if (!utils.checkObjectId(submissionId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  var newScore;
  if(!req.body.score) {
    res.send(400, {'error': 'Invalid new score'});
    return;
  } else {
    newScore = parseInt(req.body.score, 10);
  }

  req.log.info(req.user);

  if(req.user.role.toLowerCase() !== 'professor') {
    res.send(401, {'error': 'Unauthorized user to modified grade'});
    return;
  }

  req.submissions.changeScore(submissionId, newScore, function (err, submission) {
    if (err) {
      return next(err);
    }

    if(!submission) { 
      res.send(404, {'error': 'Submission not found'});
      return;
    }

    res.send(200);

    var params = {
      'to': submission.user.email,
      'fromname': 'Panda Code System',
      'subject': 'Assignment Score Change Notification',
      'text': 'This is an automated notification to inform that the score of ' +
        'the submission made on ' + submission.submitDate + ' for the ' +
        'assignment titled "' + submission.assignment.name + '"" has been ' +
        'overridden from ' + submission.score + ' to ' + newScore
    };

    req.log.debug(params);

    sendgrid.send(params);
  });
}

var middleware = express();

middleware.use(function (req, res, next) {
  req.users = new Users(req.db);
  req.assignments = new Assignments(req.db);
  req.submissions = new Submissions(req.db);
  next();
});

middleware.get('/submissions', getSubmissions);
middleware.get('/submissions/:submissionId', getSubmission);
middleware.post('/submissions', express.bodyParser(), createSubmission);
middleware.put('/submissions/:submissionId/score', express.bodyParser(),
  changeScore);

module.exports = middleware;