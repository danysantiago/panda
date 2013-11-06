/**
 * The Panda AngularJS app main entry point. :)
 */
var pandaApp = angular.module('pandaApp', ['panda.services',
  'http-auth-interceptor', 'ngRoute', 'ngScrollTo']);

/**
 * This is the resolve map for the current logged in user that will be injected
 * in the necessary controllers.
 */
var currentUserMapper = ['CurrentUserLoader', function(CurrentUserLoader) {
  return CurrentUserLoader();
}];

/**
 * This sets the css for each page...
 */
var cssSetter = function(name) {
  return function() {
    // Could also create a link element, or a service for stylesheets :|
    angular.element('link#mainCss').replaceWith(
      '<link id="mainCss" href="css/' + name + '.css" rel="stylesheet">');
  }
};

/**
 * User roles. It's like a binary enum kind of thing.
 * Routes will have different access levels. If you want to know if a user role
 * has access to some content, just do userRole & accessLevel (binary AND).
 * See http://frederiknakstad.com/authentication-in-single-page-applications-with-angular-js/
 */
var userRoles = {
  anonymous: 1, // 0001
  student: 2, // 0010
  professor: 4, // 0100
  admin: 8 // 1000
};

var accessLevels = {
  // 1111 (everyone can access public stuff.)
  public: userRoles.anonymous | userRoles.student | userRoles.professor
      | userRoles.admin,
  
  // 1110 (students, professors and admins can access authenticated content.)
  authenticated: userRoles.student | userRoles.professor | userRoles.admin,

  // 0001 (anonymous users and admins can access anonymous content.)
  anonymous: userRoles.anonymous | userRoles.admin,

  // 1010 (student and admin have access to student content.)
  student: userRoles.student | userRoles.admin,

  // 1100 (professor and admin have access to professor content.)
  professor: userRoles.professor | userRoles.admin,

  // 1000 (only admin has access to admin content.)
  admin: userRoles.admin
};

// Set up our route so the pandaApp service can find it.
pandaApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/', {
    controller: 'IndexController',
    templateUrl: '/views/welcome.html',
    access: accessLevels.public,
    resolve: {
      style: cssSetter('index')
    }
  }).
  when('/login', {
    controller: 'LoginController',
    templateUrl: '/views/login.html',
    access: accessLevels.anonymous,
    resolve: {
      style: cssSetter('login')
    }
  }).
  when('/logout', {
    controller: 'LogoutController',
    templateUrl: '/views/logout.html',
    access: accessLevels.authenticated,
    resolve: {
      style: cssSetter('logout')
    }
  }).
  when('/account', {
    controller: 'AccountController',
    templateUrl: '/views/account.html',
    access: accessLevels.authenticated,
    resolve: {
      style: cssSetter('account'),
      currentUser: currentUserMapper
    }
  }). //** Student Routes **//
  when('/s/home', {
    controller: 'HomeController',
    templateUrl: '/views/student/studentHome.html',
    access: accessLevels.student,
    resolve: {
      style: cssSetter('home'),
      currentUser: currentUserMapper
    }
  }).
  when('/s/course/:id', {
    controller: 'CourseController',
    templateUrl: '/views/student/studentCourse.html',
    access: accessLevels.student,
    resolve: {
      style: cssSetter('course'),
      course: ['CourseLoader', function(CourseLoader) {
        return CourseLoader();
      }],
      currentUser: currentUserMapper
    }
  }).
  when('/s/courses', {
    controller: 'CoursesController',
    templateUrl: '/views/student/studentCourses.html',
    access: accessLevels.student,
    resolve: {
      style: cssSetter('studentCourses'),
      currentUser: currentUserMapper,
      courses: ['MultiCourseLoader', function(MultiCourseLoader) {
        return MultiCourseLoader();
      }],
    }
  }).
  when('/s/assignment/:id', {
    controller: 'AssignmentController',
    templateUrl: '/views/student/studentAssignment.html',
    access: accessLevels.student,
    resolve: {
      style: cssSetter('assignment'),
      assignment: ['AssignmentLoader', function(AssignmentLoader) {
        return AssignmentLoader();
      }],
      currentUser: currentUserMapper
    }
  }).
  when('/s/assignments/', {
    controller: 'AssignmentsController',
    templateUrl: '/views/student/studentAssignments.html',
    access: accessLevels.student,
    resolve: {
      style: cssSetter('assignments'),
      currentUser: currentUserMapper
    }
  }).
  when('/s/submissions/', {
    controller: 'SubmissionsController',
    templateUrl: '/views/student/studentSubmissions.html',
    access: accessLevels.student,
    resolve: {
      style: cssSetter('submissions'),
      currentUser: currentUserMapper
    }
  }).
  when('/s/grades/', {
    controller: 'GradesController',
    templateUrl: '/views/student/studentGrades.html',
    access: accessLevels.student,
    resolve: {
      style: cssSetter('grades'),
      currentUser: currentUserMapper
    }
  }). //** Professor routes **//
  when('/p/home', {
    controller: 'ProfessorHomeController',
    templateUrl: '/views/professor/professorHome.html',
    access: accessLevels.professor,
    resolve: {
      style: cssSetter('home'),
      currentUser: currentUserMapper
    }
  }).
  when('/p/course/:id', {
    controller: 'ProfessorCourseController',
    templateUrl: '/views/professor/professorCourse.html',
    access: accessLevels.professor,
    resolve: {
      style: cssSetter('course'),
      course: ['CourseLoader', function(CourseLoader) {
        return CourseLoader();
      }],
      currentUser: currentUserMapper
    }
  }).
  when('/p/courses', {
    controller: 'ProfessorCoursesController',
    templateUrl: '/views/professor/professorCourses.html',
    access: accessLevels.professor,
    resolve: {
      style: cssSetter('courses'),
      currentUser: currentUserMapper
    }
  }).
  when('/p/assignment/:id', {
    controller: 'ProfessorAssignmentController',
    templateUrl: '/views/professor/professorAssignment.html',
    access: accessLevels.professor,
    resolve: {
      style: cssSetter('assignment'),
      assignment: ['AssignmentLoader', function(AssignmentLoader) {
        return AssignmentLoader();
      }],
      currentUser: currentUserMapper
    }
  }).
  when('/p/assignments/', {
    controller: 'ProfessorAssignmentsController',
    templateUrl: '/views/professor/professorAssignments.html',
    access: accessLevels.professor,
    resolve: {
      style: cssSetter('assignments'),
      currentUser: currentUserMapper
    }
  }).
  when('/p/submissions/', {
    controller: 'ProfessorSubmissionsController',
    templateUrl: '/views/professor/professorSubmissions.html',
    access: accessLevels.professor,
    resolve: {
      style: cssSetter('submissions'),
      currentUser: currentUserMapper
    }
  }). //** Other routes (these might be admin in the future **//
  when('/user/:id', { // TODO(samuel): user and users route are not being used.
    controller: 'UserController',
    access: accessLevels.admin,
    resolve: {
      style: cssSetter('user'),
      user: ['UserLoader', function(UserLoader) {
        return UserLoader();
      }],
      currentUser: currentUserMapper
    },
    templateUrl: '/views/user.html'
  }).
  when('/users', {
    controller: 'MultiUserController',
    access: accessLevels.admin,
    resolve: {
      style: cssSetter('users'),
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

  $rootScope.currentUser = null;

  LoginService(function(message, data) {
    $rootScope.loggedIn = (message === null);
    $rootScope.currentUser = data;
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
    $rootScope.currentUser = null;
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
  $rootScope.$on('event:auth-loginConfirmed', function(event, user) {
    $rootScope.loggedIn = true;
    $rootScope.currentUser = user;
    if ($location.url() == '/login' && !lastTriedUrl) {
      $location.url('/' +
          $rootScope.currentUser.role[0].toLowerCase() + '/home');
      // TODO(samuel): routes were changed so figure out
      // how to handle this :??
      
    } else if (lastTriedUrl) {
      if (lastTriedUrl == '/login' || lastTriedUrl == '/') {
        $location.url('/' +
            $rootScope.currentUser.role[0].toLowerCase() + '/home');
      } else {
        $location.url(lastTriedUrl);
      }
    }
    lastTriedUrl = null;
  });

  // Redirect if the user doesn't have enough privileges for the given route.
  $rootScope.$on("$routeChangeStart", function(event, next, current) {
    // First translate current user's role.
    var currentUserRole = userRoles.anonymous;
    if ($rootScope.currentUser) {
      currentUserRole = userRoles[$rootScope.currentUser.role.toLowerCase()];
    }

    // Determine access.
    if (!(currentUserRole & next.access)) {
      // The user has no access, redirect accordingly.
      if ($rootScope.loggedIn) {
        // TODO(samuel): Put different redirections paths according to the next
        // route. For example, if a student tried to access course-prof,
        // redirect to course.
        $location.path('/');
      } else {
        // This is already being handled by the event:auth-loginRequired.
        //$location.path('/login');
      }
    }
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
