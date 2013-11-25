/**
 * This is the controller for the student's multiple assignments view.
 */

pandaApp.controller('AssignmentsController', ['$scope', 'currentUser', 'User',
    'Course', function($scope, currentUser, User, Course) {
  $scope.user = {};

  User.get({id: currentUser._id, assignments: true, submissions: true}, function(user) {
    async.forEach(user.assignments, function(assignment, done) {
      // First cross reference with the submissions
      assignment.hasBeenCompleted = false;
      user.submissions.forEach(function(submission) {
        if (submission.Assignment == assignment._id) {
          // If a submission is perfect, mark assignment.hasBeenCompleted
          if (angular.isDefined(submission.totalScore)
              && angular.isDefined(submission.score)
              && submission.totalScore <= submission.score) {
            assignment.hasBeenCompleted = true;
          }
        }
      });

      Course.get({id: assignment.Course}, function(course) {
        // put each course in the assignment
        assignment.course = course;
        // For sorting the table:
        assignment.courseName = course.name;
        assignment.courseCode = course.code;

        // After getting the course, also get the submissions.

        done();
      }, function() {
        // could not get course...
        done();
      });
    }, function() {
      // all done
      var pendingAssignments = user.assignments.filter(function(assignment) {
        // The date is a condition, but we must also make sure that the
        // assignment doesn't have a perfect score.
        var date = new Date();
        var deadline = new Date(assignment.deadline);
        return date <= deadline && !assignment.hasBeenCompleted;
      });

      $scope.user = user;
      $scope.user.pendingAssignments = pendingAssignments;

      if (pendingAssignments.length === 0) {
        // It's better to show all assignments.
        $scope.showPendingFunction(false);
      } else {
        $scope.showPendingFunction(true);
      }

    });
  });

  ($scope.showPendingFunction = function(b) {
    $scope.showPending = b;
    if ($scope.showPending) {
      $scope.buttonMessage = "Show All";
      $scope.pageTitle = "Pending Assignments";
      $scope.assignmentsToShow = $scope.user.pendingAssignments;
    } else {
      $scope.buttonMessage = "Show Pending";
      $scope.pageTitle = "Assignments";
      $scope.assignmentsToShow = $scope.user.assignments;
    }
  })(true);

  $scope.togglePending = function() {
    $scope.showPendingFunction(!$scope.showPending);
  };

  // For ordering the assignments in the course page.
  var fieldNames = {'name': false, 'courseName': false, 'deadline': false};

  $scope.predicate = 'name';
  $scope.reverseOrder = fieldNames[$scope.predicate];

  $scope.toggleOrder = function(field) {
    Object.keys(fieldNames).forEach(function(fieldName) {
      if (fieldName === field) {
        $scope.predicate = field;
        fieldNames[field] = !fieldNames[field];
        $scope.reverseOrder = fieldNames[field];
      } else {
        fieldNames[fieldName] = false;
      }
    });
  };

}]);
