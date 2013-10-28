var config = require('../lib/config/config.js'),
    mongodb = require('mongodb'),
    async = require('async'),
    _ = require('underscore');

mongodb.connect(config.dbAddress, function (err, db) {
  var usersIds = [];
  var assignmentsIds = [];
  var coursesIds = [];
  var submissionsIds = [];

  async.series([
    function (done) {
      console.log('Dropping DB...');
      db.dropDatabase(function (err) {
        done(err);
      });
    },

    function (done) {
      //Insert assignments
      console.log('Inserting assignments...');
      var assignments = require('./res/assignments.json');
      var collection = db.collection('assignments');
      async.each(assignments, function (assignment, cb) {
        delete assignment._id;

        collection.insert(assignment, function (err, assignment) {
          assignmentsIds.push(assignment[0]._id);
          cb(err);
        });
      }, done);
    },

    function (done) {
      //Insert users
      console.log('Inserting users...');
      var users = require('./res/users.json');
      var collection = db.collection('users');
      async.each(users, function (user, cb) {
        delete user._id;

        _.each(user.Repositories, function (repo, index, list) {
          user.Repositories[index].id = assignmentsIds[repo.id];
        });

        collection.insert(user, function (err, user) {
          usersIds.push(user[0]._id);
          cb(err);
        });
      }, done);
    },

    function (done) {
      //Insert courses
      console.log('Inserting courses...');
      var courses = require('./res/courses.json');
      var collection = db.collection('courses');
      async.each(courses, function (course, cb) {
        delete course._id;

        _.each(course.Users, function (id, index, list) {
          course.Users[index] = usersIds[id];
        });

        _.each(course.Assignments, function (id, index, list) {
          course.Assignments[index] = assignmentsIds[id];
        });

        collection.insert(course, function (err, course) {
          coursesIds.push(course[0]._id);
          cb(err);
        });
      }, done);
    }

    // function (done) {
    //   //Insert submissions
    //   var submissions = require('./res/submissions.json');
    //   collection = db.collection('submissions');
    //   async.each(submissions, function (submission, cdb) {
    //     collection.insert(submission, function (err, submission) {
    //       cb(err);
    //     });
    //   }, done);
    // }
  ], function (err) {
    if(err) {
      console.log(err);
    }
    console.log('Done');

    process.exit(); //Done
  });

});
