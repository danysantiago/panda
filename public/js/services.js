var services = angular.module('panda.services', ['http-auth-interceptor',
  'ngResource']);

services.factory('User', ['$resource', function($resource) {
  return $resource('/api/users/:id', {id: '@email'});
}]);

services.factory('CurrentUser', ['$resource', function($resource) {
  return $resource('/auth/current/');
}]);

services.factory('Course', ['$resource', function($resource) {
  return $resource('/api/courses/:id', {id: '@_id'});
}]);

services.factory('Assignment', ['$resource', function($resource) {
  return $resource('/api/assignments/:id', {id: '@_id'});
}]);

services.factory('Submission', ['$resource', function($resource) {
  return $resource('/api/submissions/:id', {id: '@_id'});
}]);

services.factory('loginCheck', ['$rootScope', function($rootScope) {
  return $rootScope.loggedIn;
}]);

services.factory('MultiUserLoader', ['User', '$q',
    function(User, $q) {
  return function() {
    var delay = $q.defer();
    User.query(function(users) {
      delay.resolve(users);
    }, function() {
      delay.reject('Unable to fetch users');
    });
    return delay.promise;
  };
}]);

services.factory('UserLoader', ['User', '$route', '$q',
    function(User, $route, $q) {
  return function() {
    var delay = $q.defer();
    User.get({id: $route.current.params.id}, function(user) {
      delay.resolve(user);
    }, function() {
      delay.reject('Unable to fetch user ' + $route.current.params.id);
    });
    return delay.promise;
  };
}]);

services.factory('CurrentUserLoader', ['CurrentUser', '$q', '$location',
    'authService', function(CurrentUser, $q, $location, authService) {
  return function() {
    var delay = $q.defer();
    CurrentUser.get({}, function(currentUser) {
      delay.resolve(currentUser);
    }, function(response) {
      delay.reject();
    });
    return delay.promise;
  };
}]);

services.factory('CourseLoader', ['Course', '$route', '$q',
    function(Course, $route, $q) {
  return function() {
    var delay = $q.defer();
    Course.get({id: $route.current.params.id}, function(user) {
      delay.resolve(user);
    }, function() {
      delay.reject('Unable to fetch course' + $route.current.params.id);
    });
    return delay.promise;
  };
}]);

services.factory('AssignmentLoader', ['Assignmnet', '$route', '$q',
    function(Assignment, $route, $q) {
  return function() {
    var delay = $q.defer();
    Assignment.get({id: $route.current.params.id}, function(user) {
      delay.resolve(user);
    }, function() {
      delay.reject('Unable to fetch assignment' + $route.current.params.id);
    });
    return delay.promise;
  };
}]);

services.factory('SubmissionLoader', ['Submission', '$route', '$q',
    function(Submission, $route, $q) {
  return function() {
    var delay = $q.defer();
    Submission.get({id: $route.current.params.id}, function(user) {
      delay.resolve(user);
    }, function() {
      delay.reject('Unable to fetch Submission' + $route.current.params.id);
    });
    return delay.promise;
  };
}]);
