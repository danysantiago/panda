var pandaApp = angular.module('pandaApp', ['panda.services',
  'http-auth-interceptor', 'ngRoute']);

/**
 * This is the resolve map for the current logged in user that will be injected
 * in the necessary controllers.
 */
var currentUserMapper = ['CurrentUserLoader', function(CurrentUserLoader) {
  return CurrentUserLoader();
}];

// Set up our route so the pandaApp service can find it.
pandaApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/', {
    controller: 'IndexController',
    templateUrl: '/views/welcome.html',
  }).
  when('/login', {
    controller: 'LoginController',
    templateUrl: '/views/login.html',
  }).
  when('/home', {
    controller: 'HomeController',
    templateUrl: '/views/home.html',
    resolve: {
      currentUser: currentUserMapper
    }
  }).
  when('/account', {
    controller: 'AccountController',
    templateUrl: 'views/account.html',
    resolve: {
      currentUser: currentUserMapper
    }
  }).
  when('/user/:id', {
    controller: 'UserController',
    resolve: {
      user: ['UserLoader', function(UserLoader) {
        return UserLoader();
      }],
      currentUser: currentUserMapper
    },
    templateUrl: '/views/user.html'
  }).
  when('/users', {
    controller: 'MultiUserController',
    resolve: {
      users: ['MultiUserLoader', function(MultiUserLoader) {
        return MultiUserLoader();
      }],
      currentUser: currentUserMapper
    },
    templateUrl: '/views/users.html'
  }).
  otherwise({
    redirectTo: '/'
  });
}])
.run(['authService', '$rootScope', '$location',
    function(authService, $rootScope, $location) {
  var lastTriedUrl = null;
  $rootScope.loggedIn = false;

  $rootScope.$on('event:auth-loginRequired', function() {
    $rootScope.loggedIn = false;
    lastTriedUrl = $location.url();
    $location.url('/login');
  });

  $rootScope.$on('event:auth-loginConfirmed', function(data) {
    $rootScope.loggedIn = true;
    if ($location.url() == '/login' && !lastTriedUrl) {
      $location.url('/home');
      
    } else if (lastTriedUrl) {
      $location.url(lastTriedUrl);
    }
    lastTriedUrl = null;
  });
}]);

pandaApp.controller('UserController', ['$scope', 'user', 'currentUser',
    function($scope, user, currentUser) {
  $scope.user = user;
  $scope.currentUser = currentUser;
}]);

pandaApp.controller('MultiUserController', ['$scope', 'users', 'currentUser',
    function($scope, users, currentUser) {
  $scope.users = users;
  $scope.currentUser = currentUser;
}]);
