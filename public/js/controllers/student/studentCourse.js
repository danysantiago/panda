/**
 * This is the controller for the studnet's individual course view.
 */

pandaApp.controller('CourseController', ['$scope', 'currentUser', 'course',
    function($scope, currentUser, course) {
  $scope.course = course;
  
  // Assignments are included in course, and submissions are also included.
  var totalScore = 0;
  course.assignments.forEach(function(assignment) {
    totalScore += assignment.totalScore;
  });

  // And now count the student's submission
  var studentScore = 0;
  course.submissions.filter(function(submission) {
    // The filter is being done so that only submission of this student are
    // included. Note: the back end should take care of this.
    // TODO(samuel): update the back end to address this issue.
    return submission.user._id === currentUser._id;
  }).forEach(function(submission) {
    studentScore += submission.score;
  });

  $scope.scores = {totalScore: totalScore, studentScore: studentScore};

  // For ordering the assignments in the course page.
  var fieldNames = {'name': false, 'creationDate': false, 'deadline': false,
      'numOfTestCases': false, 'totalScore': false, 'numOfSubmissions': false
  };

  $scope.predicate = 'name';
  $scope.reverseOrder = fieldNames[$scope.predicate];

  $scope.toggleOrder = function(field) {
    Object.keys(fieldNames).forEach(function(fieldName) {
      if (fieldName === field) {
        $scope.predicate = field;
        fieldNames[field] = !fieldNames[field];
        $scope.reverseOrder = fieldNames[field];
      } else {
        fieldNames[fieldName] = false;
      }
    });
  };

}]);
