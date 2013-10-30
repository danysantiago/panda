/**
 * This is the js file for the assignments route / controller (assignments.html)
 */
pandaApp.controller('GradesController', ['$scope', 'currentUser', 'User',
    function($scope, currentUser, User) {
  // TODO(samuel): Initialize this better, since the query to the user is
  // async.
  $scope.user = {};

  var user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    $scope.user = user;
  });
}]);
