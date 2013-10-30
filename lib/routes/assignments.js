var config = require('../config/config.js'),
    express = require('express'),
    async = require('async'),
    fs = require('fs'),
    ObjectID = require('mongodb').ObjectID;

var Assignments = require('../controllers/assignments.js');
var Submissions = require('../controllers/submissions.js');

function getAssignments (req, res, next) {
  req.assignments.findAll(function (err, assignments) {
    if (err) {
      return next(err);
    }

    res.send(200, assignments);
  });
}

/*
  Gets Assignment Data Route
  Url: /api/assignments/:assignIdgit s
  Query Params:
    submissions - boolean - Result contains assignment's submissions
*/
function getAssignment (req, res, next) {
  var assignId = req.params.assignId;
  var result; //Response payload

  try { new ObjectID(assignId); } catch (err) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  async.waterfall([

    function (callback) { //Query user by its userId
      req.assignments.findById(assignId, callback);
    },

    function (assignment, callback) {
      if (!assignment) { //No assignment object, it was not found in db
        res.send(404, {'error': 'Assignment not found'});
        return;
      }

      result = assignment; //User object is response

      callback();
    },

    function (callback) {
      if(req.query.submissions === 'true') {
        //Query all submissions for this assignment
        req.submissions.findAssignmentSubmissions(assignId,
            function (err, submissions) {
          result.submissions = submissions; //Set assignments array for response
          callback(err);
        });
      } else {
        callback();
      }
    }

  ], function (err) {
    if (err) {
      return next(err);
    }

    res.send(200, result);
  });
}

function createAssignment(req, res, next) {
  var assignObj = req.body;

  //Validate payload
  var val = req.assignments.check(assignObj);
  if(!val.valid) {
    res.send(400, val.errors);
    return;
  }

  /**********
    TODO (Daniel): In here we also need to get from professor a zipped file
    that has the base files and folder structure of the assignment, we use it
    to create git repositories for students, as they get created we
    asynchronously append their path to the students repositories array and we
    notify them. If the user doesn't upload a zip file he at least must specify
    the name of the root file that will contain the entrance point of the
    students program, file must be in root of repo and defaulted to 'Main' if
    professor doesn't specify name.
  **********/

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
  //Soft deletes an assignment by its assignId
  var assignId = req.params.assignId;

  try { new ObjectID(assignId); } catch (err) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  req.assignments.del(assignId, function (err, result) {
    if (err) {
      return next(err);
    }

    //If the findAndModify doesn't return old assignment it was never there
    if(!result) {
      res.send(404, {'error': 'Assignment not found'});
      return;
    }

    //TODO (Daniel): Should not return deleted doc
    res.send(200, result);
  });
}

//function getAssignmentSubmissions(req, res, next) {}

function createTestCase(req, res, next) {
  //This is a multipart/form-data POST (i.e. NOT JSON)

  var assignId = req.params.assignId;

  try { new ObjectID(assignId); } catch (err) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  var testCase = {};
  testCase.resource = {};

  if(!req.body) { //Check we have payload
    res.send(400, {'error': 'Invalid payload'});
    return;
  }

  // Score must be integer, and is required
  if(!req.body.score && typeof req.body.score !== 'number') {
    res.send(400, {'error': 'Invalid payload, must have numeric score'});
    return;
  }

  testCase.score = req.body.score;

  //Validate time limit
  if(req.body.timeLimit && typeof req.body.timeLimit === 'number') {
    testCase.timeLimit = req.body.timeLimit;
  }
  
  //Validate mem limit
  if(req.body.memLimit && typeof req.body.memLimit === 'number') {
    testCase.memLimit = req.body.memLimit;
  }

  //Get i/o from payload or files
  var testInput = req.files.testInput || req.body.testInput;
  var testOutput = req.files.testOutput || req.body.testOutput;

  //Check file is text
  if (typeof testInput === 'object' &&
      testInput.headers['content-type'] !== 'text/plain') {
    res.send(400, {'error':
      'Invalid payload, testInput file must be text/plain'});
    return;
  }

  //Check file is text
  if (typeof testOutput === 'object' &&
      testOutput.headers['content-type'] !== 'text/plain') {
    res.send(400, {'error':
      'Invalid payload, testOutput file must be text/plain'});
    return;
  }

  //If we have tester file, check it
  var testerFile = req.files.testerFile;
  if (testerFile) {
    testCase.type = 'Exec';
    var contentType = testerFile.headers['content-type'];
    switch (contentType) {
    case 'text/x-java':
      testCase.resource.lang = 'java';
      break;
    case 'text/x-csrc':
      testCase.resource.lang = 'c';
      break;
    case 'application/javascript':
      testCase.resource.lang = 'javascript';
      break;
    default:
      res.send(400, {'error':
        'Invalid payload, testerFile file must be either' + 
        '.java, .c or .js (javascript)'});
      return;
    }
  } else {
    testCase.type = 'I/O';
  }

  async.waterfall([

    function (callback) { //Read test input
      if(typeof testInput === 'object') {
        fs.readFile(testInput.path, callback);
      } else {
        callback(null, testInput);
      }
    },

    function (testInput, callback) {
      testCase.resource.input = testInput;
      callback();
    },

    function (callback) { //Read test output
      if(typeof testOutput === 'object') {
        fs.readFile(testOutput.path, callback);
      } else {
        callback(null, testOutput);
      }
    },

    function (testOutput, callback) {
      testCase.resource.output = testOutput;
      callback();
    },

    function (callback) { //Read tester file
      if (testerFile) {
        fs.readFile(testerFile.path, function (err, data) {
          if(err) {
            return callback(err);
          }

          testCase.resource.tester = {
            'name': testerFile.originalFilename,
            'src': data
          };

          callback(err);
        });
      } else {
        callback();
      }
    },

    function (callback) { //Insert test case
      req.assignments.insertTest(assignId, testCase, callback);
    }

  ], function (err, result) {
    if (err) {
      return next(err);
    }

    //If the findAndModify doesn't return old assignment it was never there
    if(!result) {
      res.send(404, {'error': 'Assignment not found'});
      return;
    }

    res.send(201);
  });
}

function removeTestCase(req, res, next) {
  var assignId = req.params.assignId;
  var testId = req.params.testId;

  try { 
    new ObjectID(assignId); 
    new ObjectID(testId); 
  } catch (err) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  req.assignments.removeTest(assignId, testId, function (err, updates, result) {
    if (err) {
      return next(err);
    }

    if(!updates) {
      res.send(401, {'error': 'Assignment not found'});
    }

    //Note: If test wasn't in the assignment, we still say OK
    res.send(200);
  });
}

var middleware = express();

middleware.use(function (req, res, next) {
  req.assignments = new Assignments(req.db);
  req.submissions = new Submissions(req.db);
  next();
});

middleware.get('/assignments', getAssignments);
middleware.get('/assignments/:assignId', getAssignment);
middleware.post('/assignments', express.bodyParser(), createAssignment);
middleware.put('/assignments/:assignId', express.bodyParser(),
  createAssignment);
middleware.del('/assignments/:assignId', createAssignment);
// middleware.get('/assignments/:assignId/submissions',
//   getAssignmentSubmissions);
middleware.post('/assignments/:assignId/test', express.bodyParser(),
  createTestCase);
middleware.del('/assignments/:assignId/test/:testId', removeTestCase);

module.exports = middleware;