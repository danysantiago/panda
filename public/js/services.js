var services = angular.module('panda.services', ['ngResource']);

services.factory('User', ['$resource', function($resource) {
  return $resource('/api/users/:email', {email: '@email'});
}]);
/*
services.factory('Course', ['$resource', function($resource) {
  return $resource('/api/courses/:id', {id: '@_id'});
}]);

services.factory('Assignment', ['$resource', function($resource) {
  return $resource('/api/assignments/:id', {id: '@_id'});
}]);

services.factory('Submission', ['$resource', function($resource) {
  return $resource('/api/submissions/:id', {id: '@_id'});
}]);
*/

/*
services.factory('MultiUserLoader', ['User', '$q',
    function(User, $q) {
  return function() {
    var delay = $q.defer();
    User.query(function(users) {
      delay.resolve(users);
    }, function() {
      delay.reject('Unable to fetch users');
    });
    return delay.promise();
  };
}]);
*/

services.factory('UserLoader', ['User', '$route', '$q',
    function(User, $route, $q) {
  return function() {
    var delay = $q.defer();
    User.get({email: $route.current.params.email}, function(user) {
      delay.resolve(user);
    }, function() {
      delay.reject('Unable to fetch user ' + $route.current.params.email);
    });
    return delay.promise;
  };
}]);
