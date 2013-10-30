/**
 * This is the js file for the courses route (courses.html)
 */
pandaApp.controller('ProfessorCoursesController', ['$scope', 'currentUser',
    'User', function($scope, currentUser, User) {
  // TODO(samuel): Initialize this better, since the query to the user is
  // async.
  $scope.user = {};

  /**
   * Inserts the corresponding assignments into each course as an array by
   * cross-referencing the ids of assignments and courses.
   */
  var insertAssignmentsIntoCourses = function(courses, assignments) {
    // Build a map of courses, identified by id.
    var coursesMap = [];
    courses.forEach(function(course) {
      course.assignments = [];
      coursesMap[course._id] = course;
    });

    // Go through each assignment and add it to the course by lookup of id.
    assignments.forEach(function(assignment) {
      coursesMap[assignment.Course].assignments.push(assignment);
    });
  };

  var user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    insertAssignmentsIntoCourses(user.courses, user.assignments);
    $scope.user = user;
  });
}]);
