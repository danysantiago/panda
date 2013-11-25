/**
 * Admin Home
 */

pandaApp.controller('AdminHomeController', ['$scope', 'currentUser', 'users',
    '$http', '$rootScope', 'socket', function($scope, currentUser, users, $http,
    $rootScope, socket) {

  $scope.currentUser = currentUser;
  $scope.users = users;
  $scope.submissions = [];

  //Get users (refresh function)
  var refreshUsers;
  (refreshUsers = function(){
    $http.get('/api/users')
    .success(function(data) {
      // For each user we need to add the name and numOfRepos for making them
      // sortable in the user table.
      data.forEach(function(user) {
        user.name = user.firstName + ' ' + user.lastName;
        user.numOfRepos = 0;
        if (angular.isDefined(user.Repositories) && user.Repositories) {
          user.numOfRepos = user.Repositories.length;
        }
      });
      $scope.users = data;
    }).error(function() {
      //Oh snap!
    });
  })();

  //Get submissions (refresh function)
  var refreshSubmissions;
  (refreshSubmissions = function(){
    $http.get('/api/submissions')
    .success(function(data) {

      data.forEach(function(submission){
        // also add submitDateComparable so that we can sort table by date.
        submission.submitDateComparable = new Date(submission.submitDate);
        var submissionElapsedTime = 0.0;
        // Failed submissions have no tests.
        if (submission.tests) {
          submission.tests.forEach(function(test) {
            // The submission might have tests, but the tests might not have
            // results -___-
            if (test.result) {
              submissionElapsedTime += parseFloat(test.result['elapsed time']);
            }
          });
        }
        submission.elapsedTime = submissionElapsedTime + ' seconds';
      });

      $scope.submissions = data;
    }).error(function() {
      //Oh snap!
    });
  })();

  // Tab stuff.
  $scope.usersTab = true;
  $scope.submissionsTab = false;

  var tabNames = ['usersTab', 'submissionsTab'];

  $scope.showTab = function(view) {
    tabNames.forEach(function(tabName) {
      if(tabName === view) {
        $scope[tabName] = true;
      } else {
        $scope[tabName] = false;
      }
    });
  };

  $scope.userToDelete = null;
  $scope.toogleUserDeleteModal = function(user) {
    $scope.userToDelete = user;
    $('#deleteUserModal').modal();
  };

  $scope.hideUserDeleteModal = function() {
    userToDelete = null;
    $('#deleteUserModal').modal('hide');
  };

  $scope.deleteUser = function(user) {
    $http.delete('/api/users/' + user._id)
    .success(function() {
      // success
      refreshUsers();
      $('#deleteUserModal').modal('hide');
      $rootScope.showGenericErrorModal('User deleted successfully.',
          ['The user has been deleted successfully.']);
    }).error(function() {
      $rootScope.showGenericErrorModal('Error Deleting User.', ['Error']);
    });
  };

  socket.on('submissionStart', function(data) {
    refreshSubmissions();
  });
  socket.on('submissionDone', function(data) {
    refreshSubmissions();
  });

  $scope.showDetails = function(submission) {
    $scope.detailSubmission = submission;
    $('#detailModal').modal();
  }

  $scope.hideDetailModal = function(submission) {
    $('#detailModal').modal('hide');
  }

  $scope.showStackTrace = function(trace, rowId) {
    $scope.currStackTrace = trace.join('\n');
    $('#stackTraceModal').modal();
  }

  $scope.hidestackTraceModal = function() {
    $('#stackTraceModal').modal('hide');
  }

  $scope.showSourceModal = function(repoId) {
    $rootScope.initFileSystem(repoId);
    $('#sourceCodeModal').modal();
  }

  $scope.hideSourceCodeModal = function() {
    $('#sourceCodeModal').modal('hide');
  }

  // Code for sorting the user table.
  var userFieldNames = {'name': false, 'email': false, 'role': false,
    'gitId': false, 'numOfRepos': false};

  $scope.userPredicate = 'name';
  $scope.userReverseOrder =
      userFieldNames[$scope.userPredicate];

  $scope.toggleUserOrder = function(field) {
    Object.keys(userFieldNames).forEach(function(fieldName) {
      if (fieldName === field) {
        $scope.userPredicate = field;
        userFieldNames[field] = !userFieldNames[field];
        $scope.userReverseOrder = userFieldNames[field];
      } else {
        userFieldNames[fieldName] = false;
      }
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
    errorMessage: [],
    isProfessor: false
  };

  $scope.createUser = function() {
    if ($scope.newUser.password !== $scope.newUser.confirmPassword) {
      // Try again
      $('#signup-modal').modal('hide');
      $('#signup-modal-error').modal();
      $scope.newUser.errorMessage.push(
          'Please verify the information you have entered. ');;
      return;
    }

    if ($scope.newUser.password.length < 6) {
      $('#signup-modal').modal('hide');
      $('#signup-modal-error').modal();
      $scope.newUser.errorMessage.push(
          'Please verify the information you have entered.');
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
      role: ($scope.newUser.isProfessor) ? 'Professor' : 'Student'
    }).success(function() {
      $('#signup-modal').modal('hide');
      $('#signup-modal-success').modal();

      // Immediately logging in the user here does not work, because the modal
      // does not finish hiding before angular changes the browser's location.
      refreshUsers();
    }).error(function(res, data) {
      $scope.newUser.errorMessage = [];
      if (res.error && res.error.toLowerCase() === 'email already taken') {
        $scope.newUser.errorMessage.push('E-mail address already taken.\n');
      } else {
        res.forEach(function(entry) {
          if (entry.property === 'firstName') {
            $scope.newUser.errorMessage.push(
                'First Name ' + entry.message + '\n');
          }

          if (entry.property === 'lastName') {
            $scope.newUser.errorMessage.push(
                'Last Name ' + entry.message + '\n');
          }

          if (entry.property === 'email') {
            $scope.newUser.errorMessage.push(
                'The email address you entered is invalid.');
          }

        });
      }
      
      $('#signup-modal').modal('hide');
      $('#signup-modal-error').modal();
    });
  };

}]);
