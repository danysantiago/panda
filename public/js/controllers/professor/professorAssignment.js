/**
 * This is the controller for the professor's individual assignment view.
 */

pandaApp.controller('ProfessorAssignmentController', ['$scope', 'currentUser',
    'assignment', '$http', 'formDataObject', function($scope, currentUser,
        assignment, $http, formDataObject) {
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

  $scope.toggleEditAssignmentModal = function() {
    $('#editAssignmentModal').modal();
  };

  var instructionsFile = null;
  $scope.onInstructionsFileSelect = function($files) {
    instructionsFile = $files[0];
    $scope.assignment.Instructions = {file: {name: instructionsFile.name}};
  };

  $scope.editAssignment = function() {
    var putData = {
      name: assignment.name,
      shortDescription: assignment.shortDescription,
      deadline: assignment.deadline,
      numOfTries: assignment.numOfTries,
      Instructions: instructionsFile
    };

    $http({
      method: 'PUT',
      url: '/api/assignments/' + assignment._id,
      headers: {
        'Content-Type': undefined // Undefined will make angular insert correct
        // content-type.
      },
      data: putData,
      transformRequest: formDataObject
    }).success(function() {
      $('#editAssignmentModal').modal('hide');
    }).error(function() {

    });
  };
}]);
