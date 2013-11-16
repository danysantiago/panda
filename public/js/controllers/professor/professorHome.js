/**
 * This is the controller for the professor's home view.
 */

pandaApp.controller('ProfessorHomeController', ['$scope', 'currentUser', 'User',
    'Course', 'Assignment', '$upload', 'formDataObject', '$http', 'AssignmentPoster',
    '$rootScope',
        function($scope, currentUser, User, Course, Assignment, $upload,
            formDataObject, $http, AssignmentPoster, $rootScope) {

  ($scope.refreshUser = function() {
    var user = User.get({id: currentUser._id, submissions: true,
        assignments: true, courses: true}, function() {
      $scope.user = user;

      // Setting the rootScope user is important for creating a course. See the
      // method in main.js
      $rootScope.user = $scope.user;

      // Set the default course when creating a new assignment.
      $scope.newAssignment.Course = user.courses[0];

      /*
          __,___@
         [_'^   )    Oink Oink: This is for getting the assignments of a
           `//-\\    professor into user.assignments :@
           ^^  ^^
      */
      var assignments = [];
      async.each(user.courses, function(course, done) {
        var course = Course.get({id: course._id, assignments: true},
            function() {
          // Nested oinky oink: We need to reference each course with an
          // assignment some how. This is the way to do it.
          course.assignments.forEach(function(assignment) {
            assignment.courseCode = course.code;
            assignment.course = course;
          });

          // Concat == flatten.
          assignments = assignments.concat(course.assignments);
          done();
        });
      }, function () {
          $scope.user.assignments = assignments;
      });
    });
  })(); // Init the user as well :) wii

  // Add the needed refreshUser function for refreshing after adding a new
  // assignment via the main add assignment modal
  $rootScope.refreshUser = $scope.refreshUser;
}]);
