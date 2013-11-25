/**
 * This is the controller for the student's multiple course view.
 */

pandaApp.controller('CoursesController', ['$scope', '$http', 'currentUser',
    'User', 'Course', 'courses',
        function($scope, $http, currentUser, User, Course, courses) {
  // TODO(samuel): Initialize this better, since the query to the user is
  // async.
  $scope.user = {};
  $scope.courses = courses;

  // add a value course.graderName
  courses.forEach(function(course) {
    course.graderName = '';
    var grader = User.get({id: course.Graders[0].id}, function() {
      course.graderName = grader.firstName + ' ' + grader.lastName;
    }, function() {
      course.graderName = 'Ghost Professor';
    });
  });

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

          // Note: courses that are already enrolled don't really need a
          // grader name.

          // Add the course (that includes the assignments) in the courses array
          courses.push(course);
          done();
        });
      }, function () {
          $scope.user.assignments = assignments;
          // this is for adding courses that contain the assignments.
          // TODO(samuel): filter out the pending ones...
          $scope.user.courses = courses;
      });
    });
  })(); // Init the user as well :) wii

  $scope.toggleEnrollCourseModal = function() {
    $scope.refreshUser();
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
  };

}]);
