/**
 * This is the controller for the account view.
 */
pandaApp.controller('AccountController', ['$scope', 'currentUser', 'md5',
    '$rootScope', '$http', function($scope, currentUser, md5, $rootScope,
        $http) {
  $scope.user = currentUser;
  $scope.user.oldPassword = '';
  $scope.user.newPassword = '';
  $scope.user.retypePassword = '';

  $scope.changePassword = function() {
    if ($scope.user.oldPassword !== $scope.user.password) {
      $rootScope.showGenericErrorModal('Error changing password',
          ['You have entered a wrong old password.']);
      return;
    }

    if ($scope.user.newPassword !== $scope.user.retypePassword) {
      $rootScope.showGenericErrorModal('Error changing password',
          ['The new passwords do not match.']);
      return;
    }

    // OK to go
    $http.put('/api/users/' + currentUser._id,
        {password: $scope.user.newPassword}).success(function() {
      // Success
      $rootScope.showGenericErrorModal('Password change successfull',
          ['You have successfully changed your password']);
    }).error(function() {
      $rootScope.showGenericErrorModal('Error changing password',
          ['There was a problem changing your password. Try again later.']);
    });
  };

}]);
