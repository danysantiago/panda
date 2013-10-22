var pandaApp = angular.module('pandaApp', ['panda.services', 'ngRoute']);

// Set up our route so the pandaApp service can find it.
pandaApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/', {
    controller: 'IndexController',
    resolve: {
      user: ['UserLoader', function(UserLoader) {
        return UserLoader();
      }]
    },
    templateUrl: '/index.html'
  }).when('/user/:email', {
    controller: 'UserController',
    resolve: {
      user: ['UserLoader', function(UserLoader) {
        return UserLoader();
      }]
    },
    templateUrl: '/user.html'
  }).
  otherwise({
    redirectTo: '/'
  });
}]);

pandaApp.controller('IndexController', ['$scope', 'user',
    function($scope, user) {
  $scope.user = user;
}]);

pandaApp.controller('UserController', ['$scope', 'user',
    function($scope, user) {
  $scope.user = user;
}]);
