/**
 * This is the js file for the courses route (courses.html)
 */
pandaApp.controller('CoursesController', ['$scope', 'currentUser', 'User',
    function($scope, currentUser, User) {
  $scope.user = {courses:[]};

  /**
   * Adds an assignment array containing assignment objects depending on the
   * assignment ids found in courses.Assignments.
   * @param courses The courses that will be given an assignment array.
   * @param assignments An array of assignment objects.
   */
  var projectAssignmentsInCourses = function(courses, assignments) {
    // Build assignment map.
    var idsToAssignments = [];
    assignments.forEach(function(assignment) {
      idsToAssignments[assignment._id] = assignment;
    });

    // Add an assignment array for each course.
    courses.forEach(function(course) {
      course.assignments = []

      // Add the assignment objects to the array for each id.
      course.Assignments.forEach(function(assignmentId) {
        course.assignments.push(idsToAssignments[assignmentId]);
      });
    });
  };

  user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    projectAssignmentsInCourses(user.courses, user.assignments);
    $scope.user = user;
  });
}]);
