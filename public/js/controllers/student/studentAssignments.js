/**
 * This is the controller for the student's multiple assignments view.
 */

pandaApp.controller('AssignmentsController', ['$scope', 'currentUser', 'User',
    function($scope, currentUser, User) {
  // TODO(samuel): Initialize this better, since the query to the user is
  // async.
  $scope.user = {};

  /**
   * Inserts the corresponding courses into the assignments by cross-referencing
   * the ids of courses and assignments.
   */
  var insertCoursesIntoAssignments = function(courses, assignments) {
    // Build map of courses.
    var coursesMap = [];
    courses.forEach(function(course) {
      coursesMap[course._id] = course;
    });

    // Each assignment has only one course.
    assignments.forEach(function(assignment) {
      assignment.course = coursesMap[assignment.Course];
      assignment.courseName = assignment.course.name;
      assignment.courseCode = assignment.course.code;
    });
  };

  var user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    insertCoursesIntoAssignments(user.courses, user.assignments);
    $scope.user = user;

    // Filter out the assignments by date.
    var pendingAssignments = user.assignments.filter(function(assignment) {
      var date = new Date();
      var deadline = new Date(assignment.deadline);
      return date <= deadline;
    });

    user.pendingAssignments = pendingAssignments;

  });

  $scope.showPending = false;
  ($scope.togglePending = function() {
    $scope.showPending = !$scope.showPending;
    if ($scope.showPending) {
      $scope.buttonMessage = "Show All";
      $scope.pageTitle = "Pending Assignments";
      $scope.assignmentsToShow = user.pendingAssignments;
    } else {
      $scope.buttonMessage = "Show Pending";
      $scope.pageTitle = "Assignments";
      $scope.assignmentsToShow = user.assignments;
    }
  })();
}]);
