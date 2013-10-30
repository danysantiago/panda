pandaApp.controller('CourseController', ['$scope', 'currentUser', 'course',
    function($scope, currentUser, course) {
  $scope.course = course;
}]);
