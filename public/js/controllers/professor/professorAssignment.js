pandaApp.controller('ProfessorAssignmentController', ['$scope', 'currentUser',
    'assignment', function($scope, currentUser, assignment) {
  $scope.assignment = assignment;

  $scope.isInfoVisible = true;
  $scope.isSubmissionsVisible = false;
  $scope.isTestCasesVisible = false;
  $scope.isRepositoryVisible = false;

  $scope.showInfo = function() {
    $scope.isInfoVisible = true;
    $scope.isSubmissionsVisible = false;
    $scope.isTestCasesVisible = false;
    $scope.isRepositoryVisible = false;
  };

  $scope.showSubmissions = function() {
    $scope.isInfoVisible = false;
    $scope.isSubmissionsVisible = true;
    $scope.isTestCasesVisible = false;
    $scope.isRepositoryVisible = false;
  };

  $scope.showTestCases = function() {
    $scope.isInfoVisible = false;
    $scope.isSubmissionsVisible = false;
    $scope.isTestCasesVisible = true;
    $scope.isRepositoryVisible = false;
  };

  $scope.showRepository = function() {
    $scope.isInfoVisible = false;
    $scope.isSubmissionsVisible = false;
    $scope.isTestCasesVisible = false;
    $scope.isRepositoryVisible = true;
  };

}]);
