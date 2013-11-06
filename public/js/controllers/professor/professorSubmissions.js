/**
 * This is the controller for the professor's submission view.
 */

pandaApp.controller('ProfessorSubmissionsController', ['$scope', 'currentUser',
    'User', function($scope, currentUser, User) {
  $scope.user = {};

  var user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    $scope.user = user;
  });
}]);
