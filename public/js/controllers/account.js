/**
 * This is the controller for the account view.
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

  $scope.getImage = function() {
  	//TODO(samuel): fix this
  	var crypto = require('crypto');
		var hash = crypto.createHash('md5').update(currentUser._email.toLowerCase()).digest('hex');
  	return 'http://www.gravatar.com/avatar/' + hash + '?d=mm';
  };

}]);
