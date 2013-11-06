/**
 * This is the controller for the student's submission view.
 */

pandaApp.controller('SubmissionsController', ['$scope', 'currentUser', 'User',
    'Assignment', function($scope, currentUser, User, Assignment) {
  $scope.user = {};

  // Iterate through assignments and then through the submissions
  var user = User.get({id: currentUser._id, assignments: true, courses: true,
      submissions: true}, function() {
    $scope.user = user;

    user.submissions.forEach(function(submission) {
      // Insert courses into submissions.
      user.courses.forEach(function(course) {
        if (course._id === submission.Course) {
          submission.course = course;
        }
      });

      // Insert assignments into submissions
      user.assignments.forEach(function(assignment) {
        if (assignment._id === submission.Assignment) {
          submission.assignment = assignment;
        }
      });

      // Each submission needs its testsPassed and cpuTime calculated.
      submission.testsPassed = 0;
      submission.cpuTime = 0.0;
      submission.tests.forEach(function(test) {
        if (test.result.verdict.toLowerCase() === 'correct') {
          submission.testsPassed++;
        }

        submission.cpuTime += parseFloat(test.result['cpu usage']);
      });

      // Also, for facilitating filtering, each submission needs shortcuts for:
      submission.courseName = submission.course.name;
      submission.assignmentName = submission.assignment.name;
    });
  });
}]);
