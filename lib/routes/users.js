var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

var Users = require('../controllers/users.js');
var Courses = require('../controllers/courses.js');

var Fakes = require('./fakes.js');

function getUsers (req, res, next) {
  req.users.findAll(function (err, users) {
    if (err) {
      return next(err);
    }

    res.send(200, users);
  });
}

function getUser (req, res, next) {
  var userId = req.params.userId;
  req.users.findById(userId, function (err, user) {
    if (err) {
      return next(err);
    }

    if(!user) {
      res.send(404, {'error': 'User not found'});
      return;
    }

    res.send(200, user);
  });
}

function createUser(req, res, next) {
  var userObj = req.body;
  var val = req.users.check(userObj);
  if(!val.valid) {
    res.send(400, val.errors);
    return;
  }

  //TODO (Daniel): encrypt password

  async.waterfall([

    function (callback) {
      req.users.findOne({'email': userObj.email}, callback);
    },

    function (user, callback) {
      if(user) {
        res.send(400, {'error': 'Email already taken'});
        return;
      }

      req.users.insert(userObj, callback);
    }

  ], function (err, user) {
    if (err) {
      return next(err);
    }

    //TODO (Daniel): Should not return new user doc
    res.send(201, user);
  });

}

function updateUser(req, res, next) {
  res.send(200);
}

function deleteUser(req, res, next) {
  var userId = req.params.userId;
  req.users.del(userId, function (err, result) {
    if (err) {
      return next(result);
    }

    if(!result) {
      res.send(404, {'error': 'User not found'});
      return;
    }

    //TODO (Daniel): Should not return deleted doc
    res.send(200, result);
  });
}

function getUserCourses(req, res, next) {
  var userId = req.params.userId;

  var result;

  async.waterfall([

    function (callback) {
      req.users.findById(userId, callback);
    },

    function (user, callback) {
      if (!user) {
        res.send(404, {'error': 'User not found'});
        return;
      }

      result = user;

      callback();
    },

    function (callback) {
      req.courses.findUserCourses(userId, callback);
    }
    
  ], function (err, courses) {
    if (err) {
      return next(err);
    }

    result.courses = courses;

    res.send(200, result);
  });
}

function getUserAssignments(req, res, next) {
  res.send(200, Fakes.getUserAssignments(req.params.userId));
}

function getUserSubmissions(req, res, next) {
  res.send(200, Fakes.getUserSubmissions(req.params.userId));
}

var middleware = express();

middleware.use(function (req, res, next) {
  if(!req.user) {
    return res.send(401);
  }

  req.users = new Users(req.db);
  req.courses = new Courses(req.db);
  next();
});

middleware.get("/users", getUsers);
middleware.get("/users/:userId", getUser);
middleware.post("/users", express.bodyParser(), createUser);
middleware.put("/users/:userId", express.bodyParser(), updateUser);
middleware.del("/users/:userId", deleteUser);
middleware.get("/users/:userId/courses", getUserCourses);
middleware.get("/users/:userId/assignments", getUserAssignments);
middleware.get("/users/:userId/submissions", getUserSubmissions);

module.exports = middleware;