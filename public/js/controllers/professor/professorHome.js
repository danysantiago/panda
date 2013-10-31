/**
 * This is the js file for the professor home route (professorHome.html)
 * 
 */

pandaApp.controller('ProfessorHomeController', ['$scope', 'currentUser', 'User',
    function($scope, currentUser, User) {
  $scope.user = {courses: [], submissions: [], assignments: []};

  var user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    // TODO(samuel): Extract pending assignments first.
    $scope.user = user;
  });
}]);
