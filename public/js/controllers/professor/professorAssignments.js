/**
 * This is the js file for the assignments route / controller (assignments.html)
 */
pandaApp.controller('ProfessorAssignmentsController', ['$scope', 'currentUser',
    'User', 'Course', 'Assignment',
        function($scope, currentUser, User, Course, Assignment) {
  // TODO(samuel): Initialize this better, since the query to the user is
  // async.
  $scope.user = {};

  var user = User.get({id: currentUser._id, submissions: true,
      assignments: true, courses: true}, function() {
    // TODO(samuel): Extract pending assignments first.
    $scope.user = user;

    // Set the default course when creating a new assignment. This is optional.
    $scope.newAssignment.Course = user.courses[0];

    /*
        __,___@
       [_'^   )    Oink Oink: This is for getting the assignments of a professor
         `//-\\    into user.assignments :@
         ^^  ^^
    */
    var assignments = [];
    async.each(user.courses, function(course, done) {
      var course = Course.get({id: course._id, assignments: true}, function() {
        // Nested oinky oink: We need to reference each course with an
        // assignment some how. This is the way to do it.
        course.assignments.forEach(function(assignment) {
          assignment.courseCode = course.code;
          assignment.course = course;
        });

        // Concat == flatten.
        assignments = assignments.concat(course.assignments);
        done();
      });
    }, function () {
        $scope.user.assignments = assignments;
    });

  });

  $scope.toggleAssignmentModal = function() {
    $('#createAssignmentModal').modal();
  };

  $scope.newAssignment = {
    name: '',
    Course: null, // this is first an object, but the post will post the id str
    shortDescription: '',
    deadline: '',
    numOfTries: 0,
  };

  $scope.createAssignment = function(assignmentInfo) {
    // Post attribute Course is a string id.
    assignmentInfo.Course = assignmentInfo.Course._id;
    var newAssignment = new Assignment(assignmentInfo);
    newAssignment.$save();
  }

  var fieldNames = {'name': false, 'courseCode': false, 'creationDate': false,
    'deadline': false, 'numOfTestCases': false, 'totalScore': false,
    'numOfSubmissions': false};

  $scope.predicate = 'name';
  $scope.reverseOrder = fieldNames[$scope.predicate];

  $scope.toggleOrder = function (field) {
    Object.keys(fieldNames).forEach(function (fieldName) {
      if (fieldName === field) {
        $scope.predicate = field;
        fieldNames[field] = !fieldNames[field];
        $scope.reverseOrder = fieldNames[field];
      } else {
        fieldNames[fieldName] = false;
      }
    });
  };

}]);
