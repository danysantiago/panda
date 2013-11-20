/**
 * The Panda AngularJS app main entry point. :)
 */
var pandaApp = angular.module('pandaApp', ['panda.services',
  'http-auth-interceptor', 'ngRoute', 'ngScrollTo', 'angularFileUpload']);

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
.run(['authService', '$rootScope', '$location', 'LoginService', 'AssignmentPoster',
    'Course', function(authService, $rootScope, $location, LoginService,
      AssignmentPoster, Course) {
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

    if ($location.url() == '/login') {
      // The user is in the login screen, it was probably bad credentials.
      // Just show the incorrect credentials modal and return.
      $('#incorrect-password-modal').modal();
      return;
    }

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

  // Modal templates (create assignment, course assignment) need some code to
  // actually work. Here it is.
  $rootScope.newAssignment = {
    name: '',
    course: null,
    Course: null, // This is first an object, but the post will post the id str
    description: '',
    deadline: '',
    numOfTries: 0,
    instructions: null,
    repoFile: null,
    singleFile: false,
    singleFileName: 'Main.java'
  };

  // The refresh user function must be defined on the individual controllers.
  $rootScope.refreshUser = function() {};

  $rootScope.datePickerElement = null;

  $rootScope.toggleDatePicker = function() {
    $rootScope.datePickerElement = $('#deadlinePicker').datepicker({
      format: 'mm/dd/yyyy',
    });
  };

  $rootScope.createAssignment = function(assignmentInfo) {
    var errors = {
      course: false,
      name: false,
      description: false,
      deadline: false,
      tries: false,
      instructionFile: false,
      singleFileName: false,
      repoFile: false
    };

    // We need to fill up the Course field correctly.
    // And validate whether the course field has actually been selected or not.
    if (!assignmentInfo.course || !assignmentInfo.course._id) {
      // Set the fact that the course has an error.
      errors.course = true;
    } else {
      // The course is good :)
      assignmentInfo.Course = assignmentInfo.course._id;
    }

    if (!$rootScope.datePickerElement) {
      // No date was selected, ever.
      errors.deadline = true;
    } else {
      assignmentInfo.deadline =
      $rootScope.datePickerElement.datepicker('getFormattedDate');

      var today = new Date((new Date()).toLocaleDateString());
      if (!assignmentInfo.deadline ||
          (new Date(assignmentInfo.deadline)) < today) {
        errors.deadline = true;
      }
    }

    if (!assignmentInfo.name || !assignmentInfo.name.match(/^[a-zA-Z0-9 ]+$/)) {
      errors.name = true;
    }

    if (!assignmentInfo.description) {
      errors.description = true;
    }

    if (!parseInt(assignmentInfo.numOfTries) ||
        parseInt(assignmentInfo.numOfTries) < 1) {
      errors.tries = true;
    }

    if (!assignmentInfo.instructions) {
      errors.instructionFile = true;
    }

    if (assignmentInfo.singleFile &&  !assignmentInfo.singleFileName) {
      errors.singleFileName = true;
    }

    if (!assignmentInfo.singleFile && !assignmentInfo.repoFile) {
      errors.repoFile = true;
    }

    // If there is any errors, then show the error messages and return.
    var errorMessages = [];
    for (var errorType in errors) {
      if (errors[errorType]) {
        switch(errorType) {
          case 'course':
            errorMessages.push('Select a valid course.');
            break;
          case 'name':
            errorMessages.push('Enter a valid name (i.e. only letters, ' +
                'numbers and spaces.');
            break;
          case 'description':
            errorMessages.push('Enter a description.');
            break;
          case 'deadline':
            errorMessages.push('Enter a valid deadline date.');
            break;
          case 'tries':
            errorMessages.push('Enter a valid number of tries.');
            break;
          case 'instructionFile':
            errorMessages.push('Select a valid instruction file.');
            break;
          case 'singleFileName':
            errorMessages.push('Enter a valid file name.');
            break;
          case 'repoFile':
            errorMessages.push('Select a valid repository file.');
            break;
          default:
            break;
        }
      }
    }

    if (errorMessages.length > 0) {
      // There were errros. Display them and abort.
      $rootScope.showGenericErrorModal('Invalid assignment information',
          errorMessages);
      return;
    }

    AssignmentPoster.postAssignment(assignmentInfo, function() {
      $('#createAssignmentModal').modal('hide');
      $rootScope.refreshUser();

      // Finally, we need to clear all inputed data.
      $rootScope.newAssignment = {
        name: '',
        course: null,
        Course: null, // This is first an object, but the post will post the id str
        description: '',
        deadline: '',
        numOfTries: 0,
        instructions: null,
        repoFile: null,
        singleFile: false,
        singleFileName: 'Main.java'
      };

      // This is an extremely quick fix for the invalid course in single course
      // page bug. If a second assignment is created in the individual prof
      // course page, select a valid course error message appears because in the
      // expression above we deleted the initial course value of the new
      // assignment. Oops. Check professorCourse.js
      if (angular.isDefined($rootScope.setInitialCourse)) {
        $rootScope.setInitialCourse();
      }

    }, function() {
      // Failure for some reason... again, show the error.
      $rootScope.showGenericErrorModal('Invalid assignment information',
        ['Please verify your uploaded files are of the supported file types.',
        'Instructions can be uploaded in PDF files.',
        'Repository files can be uploaded in .zip files.']);
    });
  };

  $rootScope.onInstructionsFileSelect = function($files) {
    $rootScope.newAssignment.instructions = $files[0];
  };

  $rootScope.onRepoFileSelect = function($files) {
    $rootScope.newAssignment.repoFile = $files[0];
  };

  $rootScope.toggleAssignmentModal = function() {
    $('#createAssignmentModal').modal();
  };

  // This is all stuff for adding a course.
  $rootScope.toggleCourseModal = function() {
    // Call the modal just how you do with bootstrap jqueried
    $('#createCourseModal').modal();
  };

  $rootScope.newCourse = {
    name: '',
    code: '',
    year: '',
    semester: ''
  };

  $rootScope.createCourse = function(courseInfo) {
    var errors = {
      name: false,
      code: false,
      year: false,
      semester: false,
    };

    if (!courseInfo.name) {
      errors.name = true;
    }

    var coursePattern = /[A-Za-z]{4}[0-9]{4}/;
    if (!courseInfo.code || !courseInfo.code.match(coursePattern)) {
      errors.code = true;
    }

    if (!courseInfo.year || !parseInt(courseInfo.year)) {
      errors.year = true;
    }

    var semesterPattern = /^fall$|^spring$|^summer$/i;
    if (!courseInfo.semester || !courseInfo.semester.match(semesterPattern)) {
      errors.semester = true;
    }

    var errorMessages = [];
    for (var errorType in errors) {
      if (errors[errorType]) {
        switch (errorType) {
          case 'name':
            errorMessages.push('Enter a valid course name.');
            break;
          case 'code':
            errorMessages.push('Enter a 4 letter and 4 digit course code.');
            break;
          case 'year':
            errorMessages.push('Select a valid year.');
            break;
          case 'semester':
            errorMessages.push('Select a valid session.');
            break;
          default:
            break
        }
      }
    }

    if (errorMessages.length > 0) {
      // We had errors. Display them and abort.
      $rootScope.showGenericErrorModal('Invalid course information',
          errorMessages);
      return;
    }

    courseInfo.grader = $rootScope.user._id;
    var newCourse = new Course(courseInfo);
    newCourse.$save(function() {
      // success...
      $('#createCourseModal').modal('hide');
      // Refresh data so that the table contains the newly added course.
      $rootScope.refreshUser();
    }, function() {
      // Error, something blew up.
      $rootScope.showGenericErrorModal('Invalid course information',
        ['Please verify the information you have entered.']);
    });
  };

  // Code for manipulating the generic error modal
  $rootScope.toggleGenericErrorModal = function() {
    $('#generic-error-modal').modal();
  };

  $rootScope.hideGenericErrorModal = function() {
    $('#generic-error-modal').modal('hide');
  };

  // Call the generic error modal with some information... the info must be in
  // the root scope. It supports multiple messages.
  $rootScope.genericErrorModalInfo = {
    title: '',
    messages: []
  };

  $rootScope.showGenericErrorModal = function(title, messages) {
    $rootScope.genericErrorModalInfo.title = title;
    $rootScope.genericErrorModalInfo.messages = messages;
    $rootScope.toggleGenericErrorModal();
  };

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
