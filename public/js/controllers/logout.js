/**
 * Controller for the log out view.
 */
pandaApp.controller('LogoutController', ['$scope', '$http', '$rootScope',
    function($scope, $http, $rootScope) {
  var logout = {message: 'Logging you out...'};
  $http.get('/auth/logout').success(function() {
    logout.message = 'Logged out successfully';
    // Set the global loggedIn flag here.
    $rootScope.loggedIn = false;
  })
  .error(function() {
    logout.message = 'There was a problem logging you out. Please try again.';
  });
  $scope.logout = logout;
}]);
