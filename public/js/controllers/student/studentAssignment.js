pandaApp.controller('AssignmentController', ['$scope', 'currentUser', 'assignment',
    function($scope, currentUser, assignment) {
  $scope.assignment = assignment;

  $scope.infoTab = true;
  $scope.submissionsTab = false;
  $scope.testCasesTab = false;
  $scope.repositoryTab = false;

  var tabNames = ['infoTab', 'submissionsTab', 'testCasesTab', 'repositoryTab'];

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

