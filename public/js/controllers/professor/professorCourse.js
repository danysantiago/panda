/**
 * This is the controller for the professor's individual course view.
 */

pandaApp.controller('ProfessorCourseController', ['$scope', 'currentUser',
    'course', function($scope, currentUser, course) {
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

}]);
