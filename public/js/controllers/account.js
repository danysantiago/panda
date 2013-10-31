/**
 * Controller for the account view.
 */
pandaApp.controller('AccountController', ['$scope', 'currentUser',
    function($scope, currentUser) {
  $scope.user = currentUser;
  $scope.isProfileVisible = true;
  $scope.isSecurityVisible = false;

  $scope.showProfile = function() {
    $scope.isProfileVisible = true;
    $scope.isSecurityVisible = false;
  };

  $scope.showSecurity = function() {
    $scope.isProfileVisible = false;
    $scope.isSecurityVisible = true;
  };

}]);
