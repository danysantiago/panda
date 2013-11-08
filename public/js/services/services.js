/**
 * This file contains all the angular services that are used accross the
 * whole application.
 */
var services = angular.module('panda.services', ['http-auth-interceptor',
  'ngResource']);

services.factory('User', ['$resource', function($resource) {
  return $resource('/api/users/:id', {id: '@_id'});
}]);

services.factory('CurrentUser', ['$resource', function($resource) {
  return $resource('/auth/current/');
}]);

services.factory('Course', ['$resource', function($resource) {
  return $resource('/api/courses/:id', {id: '@_id'},
      {update: {method: 'PUT'}});
}]);

services.factory('Assignment', ['$resource', function($resource) {
  return $resource('/api/assignments/:id', {id: '@_id'});
}]);

services.factory('Submission', ['$resource', function($resource) {
  return $resource('/api/submissions/:id', {id: '@_id'});
}]);

services.factory('formDataObject', function() {
  return function(data) {
    var fd = new FormData();
    angular.forEach(data, function(value, key) {
      fd.append(key, value);
    });
    return fd;
  };
});

services.factory('LoginService', ['$http', function($http) {
  var verifyAuth = function(callback) {
    $http.get('/auth/current').success(function(response) {
      callback(null, response);
    })
    .error(function() {
      callback('There was an error verifying the user.', null);
    });
  };

  return verifyAuth;
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
    Course.get({id: $route.current.params.id,
        users: true, assignments: true, submissions: true},
        function(course) {
      delay.resolve(course);
    }, function() {
      delay.reject('Unable to fetch course' + $route.current.params.id);
    });
    return delay.promise;
  };
}]);

services.factory('MultiCourseLoader', ['Course', '$q',
    function(Course, $q) {
  return function() {
    var delay = $q.defer();
    Course.query(function(courses) {
      delay.resolve(courses);
    }, function() {
      delay.reject('Unable to fetch courses');
    });
    return delay.promise;
  };
}]);

services.factory('AssignmentLoader', ['Assignment', '$route', '$q',
    function(Assignment, $route, $q) {
  return function() {
    var delay = $q.defer();
    Assignment.get({id: $route.current.params.id, submissions: true},
        function(assignment) {
      delay.resolve(assignment);
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
    Submission.get({id: $route.current.params.id}, function(submission) {
      delay.resolve(submission);
    }, function() {
      delay.reject('Unable to fetch Submission' + $route.current.params.id);
    });
    return delay.promise;
  };
}]);

/**
 * Service for posting an assignment.
 */
services.factory('AssignmentPoster', ['$http', 'formDataObject',
    function($http, formDataObject) {
  var assignmentPosterInstance = {};
  assignmentPosterInstance.postAssignment = function(assignmentInfo,
      successCallBack, failureCallBack) {
    // Could return the promise of this, but don't know, that's probably
    // useless.
    var postData = {
      Course: assignmentInfo.Course,
      name: assignmentInfo.name,
      description: assignmentInfo.description,
      deadline: assignmentInfo.deadline,
      numOfTries: assignmentInfo.numOfTries,
      instructions: assignmentInfo.instructions,
      repoFile: assignmentInfo.repoFile
    };

    if (assignmentInfo.singleFile) {
      postData.singleFileName = assignmentInfo.singleFileName;
    } else {
      postData.repoFile = assignmentInfo.repoFile;
    }

    $http({
      method: 'POST',
      url: '/api/assignments/',
      headers: {
        'Content-Type': undefined // Undefined will make angular insert correct
        // content-type.
      },
      data: postData,
      transformRequest: formDataObject
    }).success(successCallBack).error(failureCallBack);
  };

  return assignmentPosterInstance;
}]);
