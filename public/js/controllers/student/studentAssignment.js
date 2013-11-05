pandaApp.controller('AssignmentController', ['$scope', 'currentUser',
    'assignment', function($scope, currentUser, assignment) {
  $scope.assignment = assignment;
  $scope.user = currentUser;

  // Filter the submissions of this assignment. We only need this particular
  // student's submissions.
  assignment.submissions = assignment.submissions.filter(function(submission) {
    return submission.user._id === currentUser._id;
  });

  // Determine the student's score in the assignment and also each of the
  // submission's totalTime.
  var studentScore = 0;
  assignment.submissions.forEach(function(submission) {
    studentScore += submission.score;

    var submissionCpuTime = 0.0;
    submission.tests.forEach(function(test) {
      submissionCpuTime += parseFloat(test.result['cpu usage']);
    });
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

  $scope.isDefined = angular.isDefined;

  // Tab stuff.
  $scope.infoTab = true;
  $scope.submissionsTab = false;
  $scope.repositoryTab = false;

  var tabNames = ['infoTab', 'submissionsTab', 'repositoryTab'];

  $scope.showTab = function (view) {
    tabNames.forEach(function (tabName) {
      if(tabName === view) {
        $scope[tabName] = true;
      } else {
        $scope[tabName] = false;
      }
    });
  };

}]);
