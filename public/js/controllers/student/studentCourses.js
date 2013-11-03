/**
 * This is the js file for the courses route (courses.html)
 */
pandaApp.controller('CoursesController', ['$scope', '$http', 'currentUser',
    'User', 'Course', 'courses',
        function($scope, $http, currentUser, User, Course, courses) {
  // TODO(samuel): Initialize this better, since the query to the user is
  // async.
  $scope.user = {};
  $scope.courses = courses;

  ($scope.refreshUser = function() {
    var user = User.get({id: currentUser._id, submissions: true,
        assignments: true, courses: true}, function() {
      $scope.user = user;

      /*
          __,___@
         [_'^   )    Oink Oink: This is for getting the assignments of a
           `//-\\    professor into user.assignments :@
           ^^  ^^
      */
      var assignments = [];
      var courses = [];
      async.each(user.courses, function(userCourse, done) {
        var course = Course.get({id: userCourse._id, assignments: true},
            function() {
          // Nested oinky oink: We need to reference each course with an
          // assignment some how. This is the way to do it.
          course.assignments.forEach(function(assignment) {
            assignment.courseCode = course.code;
            assignment.course = course;
          });

          // Concat == flatten.
          assignments = assignments.concat(course.assignments);

          // Add the course (that includes the assignments) in the courses array
          courses.push(course);
          done();
        });
      }, function () {
          $scope.user.assignments = assignments;
      });
    });
  })(); // Init the user as well :) wii

  $scope.toggleEnrollCourseModal = function() {
    $('#addCourseModal').modal();
  };

  $scope.studentEnroll = {};
  $scope.studentEnroll.enrollCourseId = null;
  $scope.enrollCourse = function(courseId) {
    // There is a backend api route that does most of the work for us. Just
    // need a regular http post.
    $http.post('api/courses/' + courseId + '/users/' + currentUser._id, {})
    .success(function() {
      $('#addCourseModal').modal('hide');
      $scope.refreshUser();
    }).error(function() {
      // oh noes
    });
  }
}]);
