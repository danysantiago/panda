/**
 * This is the controller for the professor's individual course view.
 */

pandaApp.controller('ProfessorCourseController', ['$scope', 'currentUser',
    'course', 'formDataObject', '$http', 'Course', 'AssignmentPoster',
        function($scope, currentUser, course, formDataObject, $http, Course,
            AssignmentPoster) {
  $scope.course = course;

  //This Oink Oink Pt.2 is for mapping the grades of each student to the
  //assignments so we can populate the students table
  course.assignments.forEach(function(assignment, index) {
    assignment.grades = {};
    course.users.forEach(function(user, index) {
      user.grades.forEach(function(grade, index) {
        if(grade.Assignment === assignment._id) {
          assignment.grades[user._id] = grade.score + ' / ' + grade.totalScore;
        }
      });
      if(!angular.isDefined(assignment.grades[user._id])) {
        assignment.grades[user._id] = '---';
      }
    });
  });

  $scope.assignmentsTab = true;
  $scope.studentsTab = false;
  $scope.submissionsTab = false;

  var tabNames = ['assignmentsTab', 'studentsTab', 'submissionsTab'];

  $scope.showTab = function (view) {
    tabNames.forEach(function (tabName) {
      if(tabName === view) {
        $scope[tabName] = true;
      } else {
        $scope[tabName] = false;
      }
    });
  };

  $scope.toggleAssignmentModal = function() {
    $('#createAssignmentModal').modal();
  };

  $scope.newAssignment = {
    name: '',
    Course: course._id, // This is first an object, but the post will post the id str
    shortDescription: '',
    deadline: '',
    numOfTries: 0,
    instructions: null,
    repoFile: null,
    singleFile: false,
    singleFileName: 'Main'
  };

  $scope.createAssignment = function(assignmentInfo) {
    AssignmentPoster.postAssignment(assignmentInfo, function() {
      $('#createAssignmentModal').modal('hide');
      var c = Course.get({id: course._id, users: true, assignments: true,
          submissions: true}, function() {
        $scope.course = c;
      });
    });
  };

  $scope.onInstructionsFileSelect = function($files) {
    $scope.newAssignment.instructions = $files[0];
  };

  $scope.onRepoFileSelect = function($files) {
    $scope.newAssignment.repoFile = $files[0];
  };

  // These are the field names for the assignments table.
  var fieldNames = {'name': false, 'creationDate': false,
    'deadline': false, 'numOfTestCases': false, 'totalScore': false,
    'numOfSubmissions': false
  };

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

  // This is the logic for sorting the students table, which can only be
  // sorted by students for now.
  $scope.studentReverseOrder = false;
  $scope.toggleStudentOrder = function() {
    $scope.studentReverseOrder = !$scope.studentReverseOrder;
  };

  // This is the logic for sorting the submissions table...
  var submissionFieldNames = {'hash': false, 'student': false, 'assignment': false,
      'submissionDate': false, 'verdict': false, 'time': false, 'score': false,
      'tests': false
  };

  $scope.submissionPredicate = 'hash';
  $scope.submissionReverseOrder =
      submissionFieldNames[$scope.submissionPredicate];

  $scope.toggleSubmissionOrder = function(field) {
    Object.keys(submissionFieldNames).forEach(function(fieldName) {
      if (fieldName === field) {
        $scope.submissionPredicate = field;
        submissionFieldNames[field] = !submissionFieldNames[field];
        $scope.submissionReverseOrder = submissionFieldNames[field];
      } else {
        submissionFieldNames[fieldName] = false;
      }
    });
  };

  // TODO(samuel): The predicates MUST BE FIXED in the html page, since they
  // are not matching the correct object attributes. The user.firstName and
  // user.lastNames will need to be flatten into submissions.

  // TODO(samuel): Add filtering for the submissions.

  // Course editing:
  $scope.toggleEditCourseModal = function() {
    $('#editCourseModal').modal();
  };

  $scope.editCourse = function() {
    // $resource.$update on course does put.
    $scope.course.$update(function(c) {
      course = c;
      // The course was saved successfully.
      $('#editCourseModal').modal('hide');
    });
  };

}]);
