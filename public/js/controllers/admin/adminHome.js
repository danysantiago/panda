/**
 * This is the controller for the student's home view.
 */

pandaApp.controller('HomeController', ['$scope', 'currentUser', 'User', 'Course', 'Assignment', 'Submission',
    function($scope, currentUser, User) {
  $scope.user = {courses: [], submissions: [], assignments: []};
  $scope.courses = [];
  $scope.assignments = [];
  $scope.submissions = [];

  var user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    // TODO(samuel): Extract pending assignments first.
    $scope.user = user;
  });
}]);
