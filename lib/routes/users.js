var config = require("../config/config.js"),
    express = require("express"),
    async = require("async");

var Users = require('../controllers/users.js');

var Fakes = require('./fakes.js');

function getUsers (req, res, next) {
  res.send(200, Fakes.getUsers());
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

    //TODO (Daniel): Should not return new db user doc
    res.send(201, user);
  });

}

function updateUser(req, res, next) {
  res.send(200);
}

function deleteUser(req, res, next) {
  res.send(200);
}

function getUserCourses(req, res, next) {
  res.send(200, Fakes.getUserCourses(req.params.userId));
}

function getUserAssignments(req, res, next) {
  res.send(200, Fakes.getUserAssignments(req.params.userId));
}

function getUserSubmissions(req, res, next) {
  res.send(200, Fakes.getUserSubmissions(req.params.userId));
}

var middleware = express();

middleware.use(function (req, res, next) {
  req.users = new Users(req.db);
  next();
});

middleware.get("/users", getUsers);
middleware.get("/users/:userId", getUser);
middleware.post("/users", express.bodyParser(), createUser);
middleware.put("/users/:userId", express.bodyParser(), createUser);
middleware.del("/users/:userId", createUser);
middleware.get("/users/:userId/courses", getUserCourses);
middleware.get("/users/:userId/assignments", getUserAssignments);
middleware.get("/users/:userId/submissions", getUserSubmissions);

module.exports = middleware;