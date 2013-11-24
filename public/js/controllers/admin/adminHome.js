/**
 * Admin Home
 */

pandaApp.controller('AdminHomeController', ['$scope', 'currentUser',
    function($scope, currentUser) {
  $scope.user = currentUser;
  $scope.courses = [];
  $scope.assignments = [];
  $scope.submissions = [];

}]);
