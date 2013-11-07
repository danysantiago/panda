/**
 * This is the controller for the professor's individual assignment view.
 */

pandaApp.controller('ProfessorAssignmentController', ['$scope', 'currentUser',
    'assignment', function($scope, currentUser, assignment) {
  $scope.assignment = assignment;

  $scope.isDefined = angular.isDefined;

  $scope.testCaseType = 'I/O';

  $scope.toggleTestCaseModal = function() {
    $('#addTestCaseModal').modal();
  };

  $scope.infoTab = true;
  $scope.submissionsTab = false;
  $scope.testCasesTab = false;

  var tabNames = ['infoTab', 'submissionsTab', 'testCasesTab'];

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
