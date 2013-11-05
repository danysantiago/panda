/**
 * This is the js file for the assignments route / controller (assignments.html)
 */
pandaApp.controller('GradesController', ['$scope', 'currentUser', 'User',
    'Course', function($scope, currentUser, User, Course) {
  $scope.user = {};
  $scope.courses = [];

  // courses/:id?users=true gives users with all the grades, &assignments=true
  // gives you total score and number of assignments.
  var user = User.get({id: currentUser._id, courses: true}, function() {
    $scope.user = user;

    // TODO(samuel): async
    user.courses.forEach(function(course) {
      var c = Course.get({id: course._id, users: true, assignments: true},
          function() {
        // Filter out unneccessary users. After this, c.users.length should be 1
        c.users.filter(function(user) {
          return user._id === currentUser._id;
        });

        // Count student accumulated score.
        c.users.forEach(function(user) {
          var accumulatedScore = 0;
          user.grades.forEach(function(grade) {
            accumulatedScore += grade.score;
          });
          c.userAccumulatedScore = accumulatedScore;
        });

        // Count total course score.
        var courseTotalScore = 0;
        c.assignments.forEach(function(assignment) {
          courseTotalScore += assignment.totalScore;
        });
        c.courseTotalScore = courseTotalScore;

        $scope.courses.push(c);
      });
    })
  });
}]);
