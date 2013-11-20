/**
 * This is the controller for the account view.
 */
pandaApp.controller('AccountController', ['$scope', 'currentUser', 'md5',
    function($scope, currentUser, md5) {
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

  $scope.getImage = function() {
  	var hash = createHash(currentUser.email.toLowerCase() || '');
  	return 'http://www.gravatar.com/avatar/' + hash + '?d=mm';
  };

}]);
