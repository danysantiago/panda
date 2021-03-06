/**
 * This is the controller for the student's home view.
 */

pandaApp.controller('HomeController', ['$scope', 'currentUser', 'User',
    function($scope, currentUser, User) {
  $scope.user = {courses: [], submissions: [], assignments: []};

  var user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    // TODO(samuel): Extract pending assignments first.
    $scope.user = user;
  });
}]);
