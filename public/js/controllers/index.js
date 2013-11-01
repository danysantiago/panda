/**
 * Controller for the index view.
 */
pandaApp.controller('IndexController', ['$scope',
    function($scope) {
  // Do nothing for now.
}]);

pandaApp.controller('NavbarController', ['$rootScope', '$scope',
    function($rootScope, $scope) {

  $scope.getHomeRouteByRole = function() {
    var currentUser = $rootScope.currentUser;
    var currentRole = (currentUser ? currentUser.role : null);
    
    if (currentUser && currentRole) {
      if (currentRole.toLowerCase() == 'student') {
        return '/#/s/home';
      } else if (currentRole.toLowerCase() == 'professor') {
        return '/#/p/home';
      } else {
        return '/#/login'; // for anonymous, or someting.
      }
    } else {
      return '/#/login';
    }
  };
}]);
