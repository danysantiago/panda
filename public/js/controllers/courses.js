/**
 * This is the js file for the courses route (courses.html)
 */
pandaApp.controller('CoursesController', ['$scope', 'currentUser', 'User',
    function($scope, currentUser, User) {
  $scope.user = {courses:[]};

  user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    console.log(user);
    user.courses = [{assignments: [{}, {}, {}]}, {}, {}, {}];
    $scope.user = user;
  });

}]);
