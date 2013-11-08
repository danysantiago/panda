/**
 * This is the controller for the professor's home view.
 */

pandaApp.controller('ProfessorHomeController', ['$scope', 'currentUser', 'User',
    'Course', 'Assignment', '$upload', 'formDataObject', '$http',
        function($scope, currentUser, User, Course, Assignment, $upload,
            formDataObject, $http) {

  ($scope.refreshUser = function() {
    var user = User.get({id: currentUser._id, submissions: true,
        assignments: true, courses: true}, function() {
      $scope.user = user;

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

  $scope.toggleCourseModal = function() {
    // Call the modal just how you do with bootstrap jqueried
    $('#createCourseModal').modal();
  };

  $scope.toggleAssignmentModal = function() {
    $('#createAssignmentModal').modal();
  };

  $scope.newCourse = {
    name: '',
    code: '',
    year: '',
    semester: ''
  };

  $scope.createCourse = function(courseInfo) {
    courseInfo.grader = $scope.user._id;
    var newCourse = new Course(courseInfo);
    newCourse.$save();
    $('#createCourseModal').modal('hide');

    // Refresh data so that the table contains the newly added course.
    $scope.refreshUser();
  };

  $scope.newAssignment = {
    name: '',
    Course: null, // This is first an object, but the post will post the id str
    shortDescription: '',
    deadline: '',
    numOfTries: 0,
    instructions: null,
    repoFile: null
  };

  $scope.createAssignment = function(assignmentInfo) {
    // Could return the promise of this, but don't know, that's probably
    // useless.
    $http({
      method: 'POST',
      url: '/api/assignments/',
      headers: {
        'Content-Type': undefined
      },
      data: {
        Course: assignmentInfo.Course._id,
        name: assignmentInfo.name,
        description: assignmentInfo.description,
        deadline: assignmentInfo.deadline,
        numOfTries: assignmentInfo.numOfTries,
        instructions: assignmentInfo.instructions,
        repoFile: assignmentInfo.repoFile
      },
      transformRequest: formDataObject
    }).success(function() {
      // Success
      $('#createAssignmentModal').modal('hide');
      $scope.refreshUser();
    }).error(function() {
      // Error
    });
  };

  $scope.onInstructionsFileSelect = function($files) {
    $scope.newAssignment.instructions = $files[0];
  };

  $scope.onRepoFileSelect = function($files) {
    $scope.newAssignment.repoFile = $files[0];
  };

}]);
