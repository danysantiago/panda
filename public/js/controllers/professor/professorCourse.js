/**
 * This is the controller for the professor's individual course view.
 */

pandaApp.controller('ProfessorCourseController', ['$scope', 'currentUser',
    'course', 'formDataObject', '$http', 'Course', function($scope, currentUser,
        course, formDataObject, $http, Course) {
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
        Course: course._id, // this is the only possible option on this view
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
      //$scope.refreshUser();
      // We now need to refresh the course.
      var c = Course.get({id: course._id, users: true, assignments: true,
          submissions: true}, function() {
        $scope.course = c;
      });

    }).error(function() {
      // Error
    });
  };

}]);
