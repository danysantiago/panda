/**
 * This is the controller for the student's individual assignment view.
 */

pandaApp.controller('AssignmentController', ['$scope', 'currentUser', '$http',
    'assignment', '$rootScope', 'Assignment', function($scope, currentUser, $http,
        assignment, $rootScope, Assignment) {
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

  $scope.formatName = function(name) {
    // Since the interpolator calls format name when the name of the assignment
    // still hasn't been populated, these checks are necessary.
    if (angular.isDefined(name) && angular.isDefined(name.replace)) {
      return name.replace(/\s/g, '').toLowerCase();
    } else {
      return '';
    }
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
  
  $scope.sendEmail = function() {
  	//send email
  	/*
  	var sendgrid = require('sendgrid')('elbuo', '050505');

  	var params = {
  		to: 'profesor email',
  		from: currentUser._email,
  		fromname: currentUser._firstName + ' ' + currentUser._lastName,
  		subject: 'Question about ' + assignment._name,
  		text: 'text from textarea'
  	} 

  	sendgrid.send(params, function(err, json) {
		});
    */
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
  }
}]);
