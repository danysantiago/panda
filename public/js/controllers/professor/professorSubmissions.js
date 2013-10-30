/**
 * This is the js file for the submissions route (submissions.html)
 */
pandaApp.controller('ProfessorSubmissionsController', ['$scope', 'currentUser',
    'User', function($scope, currentUser, User) {
  // TODO(samuel): Initialize this better, since the query to the user is
  // async.
  $scope.user = {};

  var user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    $scope.user = user;
  });
}]);
