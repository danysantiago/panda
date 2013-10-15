/**
 * This is the js file for home.html
 * 
 */

/**
 * This is the AngularController for the Affix of the home page.
 */
var AffixController = function($scope, $http) {
  var courses = [];

  $http.get('/api/users/userid/courses').success(function(data, status, headers) {
    courses = data;
    $scope.courses = courses;
  });

  $scope.courses = courses;
};

var CourseInfoController = AffixController;