/**
 * This is the controller for the site's login view.
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
  };

  $scope.toggleSignUpModal = function() {
    $('#signup-modal').modal();
  };

  $scope.newUser = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  };

  $scope.createUser = function() {
    if ($scope.newUser.password !== $scope.newUser.confirmPassword) {
      // Try again
      return;
    }

    // Do some validation here.
    var postUser = {};
    postUser.email = $scope.newUser.email;
    postUser.firstName = $scope.newUser.firstName;
    postUser.lastName = $scope.newUser.lastName;
    postUser.password = $scope.newUser.password;

    $http.post('/api/users', {
      email: postUser.email,
      firstName: postUser.firstName,
      lastName: postUser.lastName,
      password: postUser.password,
      role: 'Student'
    }).success(function() {
      $('#signup-modal').modal('hide');
    }).error(function() {

    });
  };

}]);
