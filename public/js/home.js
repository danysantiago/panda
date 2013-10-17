/**
 * This is the js file for home.html
 * 
 */

/**
 * This is the AngularController for the Affix of the home page.
 */
var AffixController = function($scope, $http) {
  var courses = [];
  $http.get('/api/users/samuel.rodriguez8@upr.edu/courses').success(function(data, status, headers) {
    var courseIds = data;
    courseIds.forEach(function(courseId) {
      $http.get('api/courses/' + courseId).success(function(data, status, headers) {
        courses.push(data);
      });
    });
    $scope.courses = courses;
  });

  $scope.courses = courses;
};

var CourseInfoController = function($scope, $http) {
  // First get the courses
  var courses = [];
  var assignments = [];

  $http.get('/api/users/samuel.rodriguez8@upr.edu/courses').success(function(data, status, headers) {
    var courseIds = data;
    courseIds.forEach(function(courseId) {
      $http.get('api/courses/' + courseId).success(function(data, status, headers) {
        courses.push(data);

        // Get the assignments for this course as well
        data.assignments.forEach(function(assignmentId) {
          $http.get('/api/assignments/' + assignmentId).success(function(data, status, headers) {
          assignments.push(data);
          $scope.assignments = assignments;
        });
        });
      });
    });
    $scope.courses = courses;
  });

  $scope.courses = courses;
  $scope.assignments = assignments;
};
