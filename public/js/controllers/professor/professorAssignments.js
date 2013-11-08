/**
 * This is the js file for the professor's multiple assignments view.
 */

pandaApp.controller('ProfessorAssignmentsController', ['$scope', 'currentUser',
    'User', 'Course', 'Assignment', 'formDataObject', '$http', 'AssignmentPoster',
        function($scope, currentUser, User, Course, Assignment, formDataObject,
            $http,AssignmentPoster) {
  $scope.user = {};

  // The reason why we are doing this is because we need to refresh the whole
  // user each time an assignment is created. This is done so that when you
  // create an assignment, the assignments table is automagically refreshed.
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

  $scope.toggleAssignmentModal = function() {
    $('#createAssignmentModal').modal();
  };

  $scope.newAssignment = {
    name: '',
    Course: null, // This is first an object, but the post will post the id str
    shortDescription: '',
    deadline: '',
    numOfTries: 0,
    instructions: null,
    repoFile: null,
    singleFile: false,
    singleFileName: 'Main'
  };

  $scope.createAssignment = function(assignmentInfo) {
    $scope.newAssignment.Course = $scope.newAssignment.Course._id;
    AssignmentPoster.postAssignment(assignmentInfo, function() {
      $('#createAssignmentModal').modal('hide');
      $scope.refreshUser();
    });
  };

  $scope.onInstructionsFileSelect = function($files) {
    $scope.newAssignment.instructions = $files[0];
  };

  $scope.onRepoFileSelect = function($files) {
    $scope.newAssignment.repoFile = $files[0];
  };

  var fieldNames = {'name': false, 'courseCode': false, 'creationDate': false,
    'deadline': false, 'numOfTestCases': false, 'totalScore': false,
    'numOfSubmissions': false};

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
