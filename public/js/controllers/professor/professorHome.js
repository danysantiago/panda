/**
 * This is the js file for the professor home route (professorHome.html)
 * 
 */

/**
 * Filter with multiple params
 */
pandaApp.filter('filterByAttributes', function() {
  return function(array, query, attributes) {
    if (!array || !query) {
      return array;
    }

    // Returns an array filtered by the params. Params is an array of object
    // attributes that we wish to filter.
    return array.filter(function(element) {
      for (var i = 0; i < attributes.length; i++) {
        if (element[attributes[i]].toLowerCase().indexOf(
            query.toLowerCase()) > -1) {
          return true;
        };
      }
      return false;
    });
  };
});

pandaApp.controller('ProfessorHomeController', ['$scope', 'currentUser', 'User', 'Course',
    function($scope, currentUser, User, Course) {

  var user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    // TODO(samuel): Extract pending assignments first.
    $scope.user = user;
    var assignments = [];

    /*
        __,___@
       [_'^   )    Oink Oink: This is for getting the assignments of a professor
         `//-\\    into user.assignments :@
         ^^  ^^
    */
    user.courses.forEach(function(course, index) {
      var course = Course.get({id: course._id, assignments: true}, function() {
        // Nested oinky oink: We need to reference each course code with an
        // assignment some how. This is the dirty way to do it.
        course.assignments.forEach(function(assignment) {
          assignment.courseCode = course.code;
        });

        // Concat == flatten.
        assignments = assignments.concat(course.assignments);
        if (index === user.courses.length - 1) {
          $scope.user.assignments = assignments;
        }
      });
    });
  });

  $scope.toggleCourseModal = function() {
    // Call the modal just how you do with bootstrap jqueried
    $('#createCourseModal').modal();
  };

  $scope.toggleAssignmentModal = function() {
    $('#createAssignmentModal').modal();
  };

  $scope.postThat = function(courseData) {
    //
   //2 + 3;
    
  };

}]);
