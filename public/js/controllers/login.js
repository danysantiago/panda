/**
 * Controller for logging in.
 */
pandaApp.controller('LoginController', ['$scope', '$http', 'authService',
    function($scope, $http, authService) {
  var user = {'email': null, 'password': null};
  $scope.user = user;

  $scope.submit = function(email, password) {
    $http.post('/auth/login', {'email': email, 'password': password})
    .success(function (user, status, headers) {
      if (status == 200) {
        authService.loginConfirmed(user);
      } else {
        // TODO(samuel): Try again I suppose.
      }
    });
  }
}]);
