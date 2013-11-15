/**
 * This is the controller for the site's login view.
 */

pandaApp.controller('LoginController', ['$scope', '$http', 'authService',
    function($scope, $http, authService) {
  var user = {'email': null, 'password': null};
  $scope.user = user;

  $scope.submit = function(email, password) {
    $http.post('/auth/login', {'email': email, 'password': password})
    .success(function(user, status, headers) {
      if (status == 200) {
        authService.loginConfirmed(user);
      } else {
        // ?
        $('#service-unavailable-modal-modal').modal();
      }
    }).error(function(res, data) {
      // An error is weird at this point. This should show some other error
      // message.
      $('#service-unavailable-modal').modal();
    });
  };

  $scope.toggleSignUpModal = function() {
    $('#signup-modal').modal();
  };

  $scope.hideSignUpSuccessModal = function() {
    $('#signup-modal-success').modal('hide');
  };

  $scope.hideSignUpErrorModal = function() {
    $('#signup-modal-error').modal('hide');
    $('#signup-modal').modal();
  };

  $scope.hideIncorrectPasswordModal = function() {
    $('#incorrect-password-modal').modal('hide');
  };

  $scope.hideServiceUnavailableModal = function() {
    $('#service-unavailable-modal').modal('hide');
  };

  $scope.newUser = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    errorMessage: []
  };

  $scope.createUser = function() {
    if ($scope.newUser.password !== $scope.newUser.confirmPassword) {
      // Try again
      $('#signup-modal').modal('hide');
      $('#signup-modal-error').modal();
      $scope.newUser.errorMessage =
          "Please verify the information you have entered.";
      return;
    }

    if ($scope.newUser.password.length < 6) {
      $('#signup-modal').modal('hide');
      $('#signup-modal-error').modal();
      $scope.newUser.errorMessage =
          "Please verify the information you have entered.";
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
      $('#signup-modal-success').modal();

      // Immediately logging in the user here does not work, because the modal
      // does not finish hiding before angular changes the browser's location.
    }).error(function(res, data) {
      $scope.newUser.errorMessage = [];
      if (res.error && res.error.toLowerCase() === "email already taken") {
        $scope.newUser.errorMessage.push("E-mail address already taken.\n");
      } else {
        res.forEach(function(entry) {
          if (entry.property === "firstName") {
            $scope.newUser.errorMessage.push(
                "First Name " + entry.message + "\n");
          }

          if (entry.property === "lastName") {
            $scope.newUser.errorMessage.push(
                "Last Name " + entry.message + "\n");
          }

        });
      }
      
      $('#signup-modal').modal('hide');
      $('#signup-modal-error').modal();
    });
  };

}]);
