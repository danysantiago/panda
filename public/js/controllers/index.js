/**
 * Controller for the index view.
 */
pandaApp.controller('IndexController', ['$scope',
    function($scope) {
  // Do nothing for now.
}]);

pandaApp.controller('NavbarController', ['$rootScope', '$scope',
    function($rootScope, $scope) {

  $scope.getRoleRoute = function() {
    var currentUser = $rootScope.currentUser;
    var currentRole = (currentUser ? currentUser.role : null);
    
    if (currentUser && currentRole) {
      if (currentRole.toLowerCase() == 'student') {
        return 's';
      } else if (currentRole.toLowerCase() == 'professor') {
        return 'p';
      } else {
        return 'a'; // for anonymous, or someting.
      }
    } else {
      return 'a';
    }
  };
}]);
