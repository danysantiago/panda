/**
 * This is the controller for the student's individual assignment view.
 */

pandaApp.controller('AssignmentController', ['$scope', 'currentUser', '$http',
    'assignment', '$rootScope', 'Assignment', 'Course', function($scope,
        currentUser, $http,assignment, $rootScope, Assignment, Course) {
  $scope.assignment = assignment;
  $scope.user = currentUser;

  // Filter the submissions of this assignment. We only need this particular
  // student's submissions.
  var refreshAssignment;
  (refreshAssignment = function() {
    $scope.assignment = Assignment.get({id: assignment._id, submissions: true},
        function() {
      // Getting the assignment succeeded
      var assignment = $scope.assignment;
      
      $scope.user.repoId = '';
      if (currentUser.Repositories) {
        currentUser.Repositories.forEach(function(repository) {
          if (repository.assigId === assignment._id) {
            $scope.user.repoId = repository.id;
          }
        });
      }

      $rootScope.initFileSystem($scope.user.repoId);

      assignment.submissions = assignment.submissions.filter(function(submission) {
        return submission.user._id === currentUser._id;
      });

      // Determine the student's score in the assignment and also each of the
      // submission's totalTime.
      var studentScore = 0;
      assignment.submissions.forEach(function(submission) {
        studentScore += submission.score;

        var submissionCpuTime = 0.0;
        // Failed submissions have no tests.
        if (submission.tests) {
          submission.tests.forEach(function(test) {
            // The submission might have tests, but the tests might not have
            // results -___-
            if (test.result) {
              submissionCpuTime += parseFloat(test.result['cpu usage']);
            }
          });
        }
        submission.cpuTime = submissionCpuTime + ' seconds';
      });

      // Sort submissions by date.
      assignment.submissions.sort(function(a, b) {
        if (a.submitDate > b.submitDate) {
          return -1;
        } else if (a.submitDate < b.submitDate) {
          return 1;
        } else {
          // A student shouldn't have two submissions at the same time, but it is
          // a possibility.
          return 0;
        }
      });

      // Add the last submission date
      if (assignment.submissions.length === 0) {
        $scope.noSubmissions = true;
      } else {
        assignment.lastSubmissionDate = assignment.submissions[0].submitDate;
      }

      $scope.scores = {
        totalScore: assignment.totalScore,
        studentScore: studentScore
      };

    }, function() {
      // error getting the assignment... We should blow up now.
    });

  })();

  $scope.isDefined = angular.isDefined;

  // Tab stuff.
  $scope.infoTab = true;
  $scope.submissionsTab = false;
  $scope.repositoryTab = false;
  $scope.contactTab = false;

  var tabNames = ['infoTab', 'submissionsTab', 'repositoryTab', 'contactTab'];

  $scope.showTab = function (view) {
    tabNames.forEach(function (tabName) {
      if(tabName === view) {
        $scope[tabName] = true;
      } else {
        $scope[tabName] = false;
      }
    });
  };

  var formatAssignmentName = function(name) {
    // Since the interpolator calls format name when the name of the assignment
    // still hasn't been populated, these checks are necessary.
    if (angular.isDefined(name) && angular.isDefined(name.replace)) {
      return name.replace(/\s/g, '').toLowerCase();
    } else {
      return '';
    }
  };

  var removeEmailDomain = function(email) {
    return email.substring(0, email.indexOf('@'));
  };

  $scope.getRepositoryLink = function() {
    // the form of the link wii
    return "http://pandagitlab.sytes.net/" +
        removeEmailDomain(currentUser.email) + '/' +
            formatAssignmentName(assignment.name) + '.git';
  };

  var getProjectName = function() {
    return removeEmailDomain(currentUser.email) + '/' +
            formatAssignmentName(assignment.name);
  };

  $scope.toggleSubmitModal = function() {
    if (assignment.submissions.length >= assignment.numOfTries) {
      $rootScope.showGenericErrorModal('Submission Error',
          ['You have exceeded the number of tries for this assignment.']);
      return;
    } else {  
      $('#submit-modal').modal();
    }
  };
  
  var emailMessage = '';
  $scope.toggleConfirmSendEmailModal = function(message) {
    emailMessage = message;
    $('#confirmSendEmailModal').modal();
  };

  $scope.sendEmail = function() {
    $('#confirmSendEmailModal').modal('hide');
    var message = emailMessage;

    // The route is
    // /api/users/userId/to/receiverId (professor)
    // Send message and assignment name.
    // attributes: message, assignmentName

    var course = Course.get({id: assignment.Course}, function() {
      // success
      var graderId = course.Graders[0].id;

      var url = '/api/users/' + currentUser._id + '/to/' + graderId;
      
      $http.post(url, {message: message,
          assignmentName: $scope.assignment.name})
      .success(function() {
        // Success
        $rootScope.showGenericErrorModal('Email sent', ['The email was ' +
            'sent successfully.']);
      }).error(function() {
        // error sending email
        $rootScope.showGenericErrorModal('Problem sending email', ['The email' +
            ' could not be sent. Please try again later.']);
      });

    }, function() {
      // error getting course
      $rootScope.showGenericErrorModal('Problem sending email', ['The email' +
            ' could not be sent. Please try again later.']);
    });
  };

  $scope.submitAssignment = function() {
    if (assignment.submissions.length >= assignment.numOfTries) {
      $rootScope.showGenericErrorModal('Submission Error',
          ['You have exceeded the number of tries for this assignment.']);
      return;
    }

    $http.post('/api/submissions', {
        User: currentUser._id, Assignment: assignment._id}
    ).success(function() {
      $('#submit-modal').modal('hide');
      // This is not refreshing the submissions because the submissions are not
      // immediately populated. Some magic with sockets.io will be needed.
      refreshAssignment();
    }).error(function() {
      // Oh noes.
    });
  };

}]);
