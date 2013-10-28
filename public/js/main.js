/**
 * The Panda AngularJS app. :)
 */
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
  when('/logout', {
    controller: 'LogoutController',
    templateUrl: '/views/logout.html',
  }).
  when('/home', {
    controller: 'HomeController',
    templateUrl: '/views/home.html',
    resolve: {
      currentUser: currentUserMapper,
      homeData: ['HomeDataLoader', function(HomeDataLoader) {
          return HomeDataLoader();
      }]
    }
  }).
  when('/course/:id', {
    controller: 'CourseController',
    templateUrl: 'views/course.html',
    resolve: {
      course: ['CourseLoader', function(CourseLoader) {
        return CourseLoader();
      }],
      currentUser: currentUserMapper
    }
  }).
  when('/courses', {
    controller: 'CoursesController',
    templateUrl: 'views/courses.html',
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
.run(['authService', '$rootScope', '$location', 'LoginService',
    function(authService, $rootScope, $location, LoginService) {
  // This code runs once at the start of the app.

  /**
   * Whether the user is logged in or not.
   * Just one problem with this, loggedIn value is false for a short moment
   * until the LoginService receives a response.
   */
  $rootScope.loggedIn = false;
  LoginService(function(message, data) {
    $rootScope.loggedIn = (message === null);
  })

  /**
   * The url that was tried to be accessed before a 401 was intercepted. After
   * logging in, the user will be redirected to this url.
   */
  var lastTriedUrl = null;

  // Register a listener for the auth-loginRequired event, which is fired by
  // the http-auth-interceptor when a 401 is received from the server.
  $rootScope.$on('event:auth-loginRequired', function() {
    $rootScope.loggedIn = false;
    if ($location.url() != '/login') {
      lastTriedUrl = $location.url();
    }
    // Only redirect to the login page for the pages that require login.
    // This check is needed because / runs this run function which requires a
    // call to /auth/current by the LoginService.
    if (lastTriedUrl != '/') {
      $location.url('/login');
    }
  });

  // Register a listener for the auth-loginConfirmed event. This event is fired
  // by the LoginController when the login has been confirmed by the server.
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
