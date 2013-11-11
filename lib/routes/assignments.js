/**
  assignments.js - Contains route logistics for this resource
**/

var config = require('../config/config.js'),
    express = require('express'),
    mongodb = require('mongodb'),
    Grid = mongodb.Grid,
    GridStream = require('gridfs-stream'),
    async = require('async'),
    fs = require('fs'),
    utils = require('../utils.js');

var Users = require('../controllers/users.js');
var Courses = require('../controllers/courses.js');
var Assignments = require('../controllers/assignments.js');
var Submissions = require('../controllers/submissions.js');

var Gitlab = require('../gitlab/Gitlab');

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

  if (!utils.checkObjectId(assignId)) {
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

  if(assignObj.numOfTries) {
    assignObj.numOfTries = parseInt(assignObj.numOfTries, 10);
  }

  //Validate payload
  var val = req.assignments.check(assignObj);
  if(!val.valid) {
    res.send(400, val.errors);
    return;
  }

  req.log.info(req.files);

  var contentType;

  //Instructions files handling
  var instructionsType;
  var instructions;

  if (req.files && req.files.instructions) {

    instructions = req.files.instructions;
    contentType = instructions.headers['content-type'];

    //Check content-type we accept
    switch (contentType) {
    case 'application/pdf':
      instructionsType = 'file';
      break;
    case 'text/plain':
      instructionsType = 'text';
      break;
    default:
      res.send(400, {'error':
        'Invalid payload, instructions file must be ' +
        'text/plain or application/pdf'});
      return;
    }
  }

  //Initial repo zip file handling
  var repoFile;

  if (req.files && req.files.repoFile) {

    repoFile = req.files.repoFile;
    contentType = repoFile.headers['content-type'];

    //Check content-type we accept
    switch (contentType) {
    case 'application/zip':
    case 'application/gzip':

      break;
    default:
      res.send(400, {'error':
        'Invalid payload, repository archive file must be ' +
        'application/zip or application/gzip'});
      return;
    }

  }

  //We mus have either initial repo archive with main, or the name of the main
  //file to look for
  if (!repoFile && !assignObj.singleFileName) {
    res.send(400, {'error':
      'Invalid payload, assignment must either contain an initial repo file ' +
      'or the name of a single file to evaluate within the repo.' });
    return;
  }

  var grid = new Grid(req.db); //GridFS

  async.waterfall([

    function (callback) {
      //Process instruction file
      if (instructions && instructionsType === 'file') {
        fs.readFile(instructions.path, function (err, data) {
          if (err) {
            return callback(err);
          }

          grid.put(data, {
            'content_type': instructions.headers['content-type'],
            'filename': instructions.originalFilename,
          }, callback);
        });
      } else if (instructions && instructionsType === 'text') {
        fs.readFile(instructions.path, callback);
      } else {
        callback(null, null);
      }

    },

    function (instructionsResult, callback) {
      //Save instructions file information
      if(instructionsResult && instructionsType === 'file') {
        assignObj.Instructions = {
          'type': 'file',
          'file': {
            'name': instructions.originalFilename,
            '_id': instructionsResult._id
          }
        };
      } else if (instructionsResult && instructionsType === 'text') {
        assignObj.Instructions = {
          'type': 'text',
          'text': instructionsResult.toString()
        };
      }

      callback();
    },

    function (callback) {
      //Process repo archive file
      if (repoFile) {
        fs.readFile(repoFile.path, function (err, data) {
          if (err) {
            return callback(err);
          }

          grid.put(data, {
            'content_type': repoFile.headers['content-type'],
            'filename':  repoFile.originalFilename,
          }, callback);
        });
      } else {
        callback(null, null);
      }
    },

    function (initialRepoResult, callback) {
      //Save repo archive file information
      if(initialRepoResult) {
        assignObj.repoFile = {
          '_id': initialRepoResult._id,
          'name': repoFile.originalFilename
        };
      }
      callback();
    },

    function (callback) {
      //Insert assignment into DB
      req.assignments.insert(assignObj, callback);
    }

  ], function (err, assign) {
    if (err) {
      return next(err);
    }

    assign = assign[0];
    res.send(201, assign);

    //Create assignments repositories for students
    async.nextTick(function(){
      var gitlab = new Gitlab(req.log);

      async.waterfall([
        function (callback) { //Get assignment course
          req.courses.findById(assign.Course.toString(), callback);
        },

        function (course, callback) {
          if(course) { //Get students in course
            req.users.findAllIn(course.Users, callback);
          }
        },

        function (students, callback) {
          //Go trough each student creating the repo
          //Do to using of the FS I can't parallel create repos, check with Neli
          async.each(students, function (student, done) {
            var projectParams = {
              'user_id': student.gitId,
              'name': assign.name.replace(/\s/g, '').toLowerCase(),
              'archive': repoFile ? repoFile.path : undefined,
              'username': student.lastName + student.firstName
            };
            //Create repo first
            gitlab.project.create(projectParams, function (err, r, b) {
              if (err) {
                return done(err);
              }

              if(r && r.statusCode === 201) {
                var repoInfo = {
                  'url': b.http_url_to_repo,
                  'id': b.id,
                  'assigId': assign._id,
                  'name': projectParams.name
                };
                //Insert repo info into user
                req.users.insertRepo(student._id, repoInfo, function (err) {
                  if (err) {
                    return done(err);
                  }
                  //Populate repo with initial file,
                  //Is it necessary to init repo with no archive ??
                  if(projectParams) {
                    gitlab.project.populate(projectParams, done);
                  } else {
                    done();
                  }
                });
              }
            });
          }, callback);
        }

      ], function (err) {
        if(err) {
          req.log.error(err);
        }
      });
    });

  });
}

function updateAssignment(req, res, next) {
  res.send(200);
}

function deleteAssignment(req, res, next) {
  //Soft deletes an assignment by its assignId
  var assignId = req.params.assignId;

  if (!utils.checkObjectId(assignId)) {
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

function getAssignmentInstructions(req, res ,next) {
  var assignId = req.params.assignId;

  if (!utils.checkObjectId(assignId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  req.assignments.findById(assignId, function (err, assignment) {
    if (err) {
      return next(err);
    }

    if(!assignment) {
      res.send(404, {'error': 'Assignment not found'});
      return;
    }

    if(!assignment.Instructions) {
      res.send(404, {'error': 'Assignment has no instructions'});
      return;
    }

    if(assignment.Instructions.type === 'text') {
      res.send(200, assignment.Instructions.text);
    } else {
      var grid = new GridStream(req.db, mongodb);
      var fileStream = grid.createReadStream({
        '_id': assignment.Instructions.file._id
      });
      fileStream.pipe(res);
    }
  });
}

//function getAssignmentSubmissions(req, res, next) {}

//TODO (Daniel): Consider using FSGrids
function createTestCase(req, res, next) {
  //This is a multipart/form-data POST (i.e. NOT JSON)
  req.log.info(req.files);

  var assignId = req.params.assignId;

  if (!utils.checkObjectId(assignId)) {
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
  var testInput;
  var testOutput;

  if(req.files) {
    testInput = req.files.testInput || req.body.testInput;
    testOutput = req.files.testOutput || req.body.testOutput;
  } else {
    testInput = req.body.testInput;
    testOutput = req.body.testOutput;
  }

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
  var testerFile;
  if(req.files) {
    testerFile = req.files.testerFile;
  }
   
  if (testerFile) {
    testCase.type = 'Exec';
    var contentType = testerFile.headers['content-type'];
    switch (contentType) {
    case 'text/x-java':
    case 'text/x-java-source':
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
        var grid = new Grid(req.db); //GridFS
        
        fs.readFile(testerFile.path, function (err, data) {
          if(err) {
            return callback(err);
          }

          grid.put(data, {
            'content_type': testerFile.headers['content-type'],
            'filename':  testerFile.originalFilename,
          }, function (err, result) {

            testCase.resource.tester = {
              '_id': result._id,
              'name': testerFile.originalFilename
            };

            callback(err);
          });

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

  if (!utils.checkObjectId(assignId) || !utils.checkObjectId(testId)) {
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
  req.users = new Users(req.db);
  req.courses = new Courses(req.db);
  req.assignments = new Assignments(req.db);
  req.submissions = new Submissions(req.db);
  next();
});

middleware.get('/assignments', getAssignments);
middleware.get('/assignments/:assignId', getAssignment);
middleware.post('/assignments', express.bodyParser(), createAssignment);
middleware.put('/assignments/:assignId', express.bodyParser(),
  updateAssignment);
middleware.del('/assignments/:assignId', deleteAssignment);
// middleware.get('/assignments/:assignId/submissions',
//   getAssignmentSubmissions);
middleware.get('/assignments/:assignId/instructions',
  getAssignmentInstructions);
middleware.post('/assignments/:assignId/test', express.bodyParser({
  'uploadDir': config.tmp
}),
  createTestCase);
middleware.del('/assignments/:assignId/test/:testId', removeTestCase);

module.exports = middleware;