var config = require('../config/config.js'),
    express = require('express'),
    async = require('async'),
    utils = require('../utils.js');

var Users = require('../controllers/users.js');
var Courses = require('../controllers/courses.js');
var Assignments = require('../controllers/assignments.js');
var Submissions = require('../controllers/submissions.js');

function getCourses (req, res, next) {
  req.courses.findAll(function (err, courses) {
    if (err) {
      return next(err);
    }

    res.send(200, courses);
  });
}

/*
  Gets Course Data Route
  Url: /api/courses/:courseId
  Query Params:
    users - boolean - Result contains course's users
    assignments - boolean - Result contains course's assignments
    submissions - boolean - Result contains course's submissions
*/
function getCourse (req, res, next) {
  var courseId = req.params.courseId;
  var result; //Response payload

  if (!utils.checkObjectId(courseId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  async.waterfall([

    function (callback) { //Query course by its courseId
      req.courses.findById(courseId, callback);
    },

    function (course, callback) {
      if (!course) { //No course object, it was not found in db
        res.send(404, {'error': 'Course not found'});
        return;
      }

      result = course; //Course object is response

      callback();
    },

    function (callback) {
      if(req.query.users === 'true') {
        //Query all users that match any of the users ids in the Users array
        //of the course
        req.users.findAllIn(result.Users, function (err, users) {
          delete result.Users;
          result.users = users; //Set users array for response
          callback(err);
        });
      } else {
        callback();
      }
    },

    function (callback) {
      if(req.query.assignments === 'true') {
        //Query all assignments that has this course id
        req.assignments.findCourseAssignments(courseId,
            function (err, assignments) {
          delete result.Assignments;
          result.assignments = assignments; //Set assignments array for response
          callback(err);
        });
      } else {
        callback();
      }
    },

    function (callback) {
      if(req.query.submissions === 'true') {
        //Query all submissions that has this course id
        req.submissions.findCourseSubmissions(courseId,
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

function createCourse(req, res, next) {
  var courseObj = req.body;

  //Validate payload
  var val = req.courses.check(courseObj);
  if(!val.valid) {
    res.send(400, val.errors);
    return;
  }

  //Daniel (TODO): Consider if course code is unique within year and semester
  req.courses.insert(courseObj, function (err, course) {
    if (err) {
      return next(err);
    }

    res.send(201, course[0]);
  });
}

function updateCourse(req, res, next) {
  res.send(200);
}

function deleteCourse(req, res, next) {
  //Soft deletes a course by its userId
  var courseId = req.params.courseId;

  if (!utils.checkObjectId(courseId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  req.courses.del(courseId, function (err, result) {
    if (err) {
      return next(err);
    }

    //If the findAndModify doesn't return old course it was never there
    if(!result) { 
      res.send(404, {'error': 'Course not found'});
      return;
    }

    //TODO (Daniel): Should not return deleted doc
    res.send(200, result);
  });
}

//function getCourseUsers(req, res, next) {}

function addUser(req, res, next) {
  var courseId = req.params.courseId;
  var userId = req.params.userId;

  if (!utils.checkObjectId(courseId) || !utils.checkObjectId(userId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  async.waterfall([
    function (callback) {
      req.users.findById(userId, callback);
    },

    function (user, callback) {
      if(!user) {
        res.send(404, {'error': 'User not found'});
        return;
      }

      req.courses.insertUser(courseId, userId, callback);
    }
  ], function (err, updates, result) {
    console.log({'updates':updates});
    if(!updates) { //updates responds 0 if doc was not found
      res.send(404, {'error': 'Course not found'});
      return;
    }

    //Note: If user was already in course we will say it was OK, data will not
    //be duplicated in the DB because $adToSet was used

    res.send(200);
  });
}

function removeUser(req, res, next) {
  var courseId = req.params.courseId;
  var userId = req.params.userId;

  if (!utils.checkObjectId(courseId) || !utils.checkObjectId(userId)) {
    res.send(400, {'error': 'Invalid id format'});
    return;
  }

  req.courses.removeUser(courseId, userId, function (err, updates, result) {
    if(err) {
      return next(err);
    }

    if(!updates) {
      res.send(404, {'error': 'Course not found'});
      return;
    }

    //Note: If user wasn't in the course, we still say OK

    res.send(200);
  });
}

//function getCourseAssignments(req, res, next) {}

//function getCourseSubmissions(req, res, next) {}

var middleware = express();

middleware.use(function (req, res, next) {
  //Init controllers for routes
  req.users = new Users(req.db);
  req.courses = new Courses(req.db);
  req.assignments = new Assignments(req.db);
  req.submissions = new Submissions(req.db);
  next();
});

middleware.get('/courses', getCourses);
middleware.get('/courses/:courseId', getCourse);
middleware.post('/courses', express.bodyParser(), createCourse);
middleware.put('/courses/:courseId', express.bodyParser(), updateCourse);
middleware.del('/courses/:courseId', deleteCourse);
//middleware.get('/courses/:courseId/users', getCourseUsers);
middleware.post('/courses/:courseId/users/:userId', express.bodyParser(),
  addUser);
middleware.del('/courses/:courseId/users/:userId', removeUser);
//middleware.get('/courses/:courseId/assignments', getCourseAssignments);
//middleware.get('/courses/:courseId/submissions', getCourseSubmissions);

module.exports = middleware;