/**
 * This is the controller for the professor's multiple courses view.
 */

pandaApp.controller('ProfessorCoursesController', ['$scope', 'currentUser',
    'User', 'Course', function($scope, currentUser, User, Course) {
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
        var course = Course.get({id: userCourse._id, assignments: true,
            users: true, submissions: true}, function() {
          // Nested oinky oink: We need to reference each course with an
          // assignment some how. This is the way to do it.
          var totalCourseScore = 0;
          course.assignments.forEach(function(assignment) {
            assignment.courseCode = course.code;
            assignment.course = course;
            totalCourseScore += assignment.totalScore;
          });

          // Concat == flatten.
          assignments = assignments.concat(course.assignments);

          // Add the course (that includes the assignments) in the courses array
          course.totalScore = totalCourseScore; // Otro puerquito mas.
          courses.push(course);
          done();
        });
      }, function () {
          $scope.user.assignments = assignments;
          $scope.courses = courses;
      });
    });
  })(); // Init the user as well :) wii

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

  $scope.toggleCourseModal = function() {
    // Call the modal just how you do with bootstrap jqueried
    $('#createCourseModal').modal();
  };

  $scope.showStudents = [];
  $scope.showAssignments = [];

  /**
   * Toggles the students table of the course indexed by the given index.
   */
  $scope.toggleStudents = function(index) {
    if (!angular.isDefined($scope.showStudents[index])) {
      $scope.showStudents[index] = false;
    }

    $scope.showStudents[index] = !$scope.showStudents[index];
  };

  /**
   * Toggles the assignments table of the course indexed by the given index.
   */
  $scope.toggleAssignments = function(index) {
    if (!angular.isDefined($scope.showAssignments[index])) {
      $scope.showAssignments[index] = false;
    }
    $scope.showAssignments[index] = !$scope.showAssignments[index];
  };

  // For controlling the headers of the assignment table.
  var fieldNames = {'name': false, 'creationDate': false,
    'deadline': false, 'numOfTestCases': false, 'totalScore': false,
    'numOfSubmissions': false, 'numOfTries': false};

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

  $scope.calcGrade = function(grades) {
    // An array of grades from the student
    var totalScore = 0;
    grades.forEach(function(grade) {
      totalScore += grade.score;
    });

    return totalScore;
  };

}]);
