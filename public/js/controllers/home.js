/**
 * This is the js file for the home route (home.html)
 * 
 */

pandaApp.controller('HomeController', ['$scope', 'currentUser', 'homeData',
    function($scope, currentUser, homeData) {
  $scope.currentUser = currentUser;
  $scope.homeData = homeData;
}]);
