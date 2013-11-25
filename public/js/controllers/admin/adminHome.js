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
}]);
