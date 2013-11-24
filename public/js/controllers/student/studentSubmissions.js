/**
 * This is the controller for the student's submission view.
 */

pandaApp.controller('SubmissionsController', ['$scope', 'currentUser', 'User',
    'Course', function($scope, currentUser, User, Course) {
  $scope.user = {};

  // Iterate through assignments and then through the submissions
  User.get({id: currentUser._id, submissions: true}, function(user) {
    async.forEach(user.submissions, function(submission, done) {
      // We need to put the course into submission.
      Course.get({id: submission.Course}, function(course) {
        // we put the course into the submission
        submission.course = course;
        submission.courseName = course.name;

        // We should also put the assignment name
        submission.assignmentName = submission.assignment.name;

        // We need to calculate this submissions elapsedTime.
        var submissionElapsedTime = 0.0;
        // Failed submissions have no tests.
        if (submission.tests) {
          submission.tests.forEach(function(test) {
            // The submission might have tests, but the tests might not have
            // results -___-
            if (test.result) {
              submissionElapsedTime += parseFloat(test.result['elapsed time']);
            }
          });
        }
        submission.elapsedTime = submissionElapsedTime + ' seconds';

        if (!angular.isDefined(submission.score) || !submission.score) {
          submission.score = 0;
        }

        if (angular.isDefined(submission.assignment.TestCases) &&
            submission.assignment.TestCases) {
          submission.totalTestCases = submission.assignment.TestCases.length;
        } else {
          submission.totalTestCases = 0;
        }

        if (angular.isDefined(submission.acceptedTestCases) &&
            submission.acceptedTestCases) {
          submission.testsPassed = submission.acceptedTestCases;
        } else {
          submission.testsPassed = 0;
        }
        
        // We also need the number of tests passed and the total number of
        // of thest cases.
        // the number of test cases is in submission.assignment.TestCases.length
        // the number of passed test cases is in acceptedTestCases, if it exists

        done();
      }, function() {
        // error getting the course.
      });

    }, function() {
      // all done
      // We can now store the user safely
      $scope.user = user;
    });
  }, function() {
    // could not get the user
  })
}]);
