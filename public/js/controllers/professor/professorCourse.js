/**
 * This is the controller for the professor's individual course view.
 */

pandaApp.controller('ProfessorCourseController', ['$scope', 'currentUser',
    'course', 'formDataObject', '$http', 'Course', 'AssignmentPoster', '$rootScope',
        function($scope, currentUser, course, formDataObject, $http, Course,
            AssignmentPoster, $rootScope) {
  $scope.course = course;

  //This Oink Oink Pt.2 is for mapping the grades of each student to the
  //assignments so we can populate the students table
  ($scope.refreshUser = function() {
    // We need to get the course again actually.
    // Injecting the course doesn't do much in this case then.
    var newCourse = Course.get({id: course._id, users: true, assignments: true,
        submissions:true}, function(c) {
      // successfully got the course.
      course = newCourse;
      $scope.course = course;

      course.assignments.forEach(function(assignment, index) {
        assignment.grades = {};
        course.users.forEach(function(user, index) {
          user.grades.forEach(function(grade, index) {
            if(grade.Assignment === assignment._id) {
              assignment.grades[user._id] = grade.score + ' / ' + grade.totalScore;
            }
          });
          if(!angular.isDefined(assignment.grades[user._id])) {
            assignment.grades[user._id] = '---';
          }
        });
      });

      course.submissions.forEach(function(submission) {
        //studentScore += submission.score;

        var submissionElapsedTime = 0.0;
        // Failed submissions have no tests.
        if (submission.tests) {
          submission.tests.forEach(function(test) {
            // The submission might have tests, but the tests might not have
            // results -___-
            if (test.result) {
              submissionElapsedTime += parseFloat(test.result['elapsed time']);
            }
          });
        }
        submission.elapsedTime = submissionElapsedTime + ' seconds';
      });

      course.users.forEach(function(user) {
        // For each user, we need a field called name for sorting them in the
        // students table.
        user.name = user.firstName + ' ' + user.lastName;
      });

    }, function() {
      // error getting the course. No idea why
      // TODO(samuel): handle this
    });    
  })();
  $rootScope.refreshUser = $scope.refreshUser;

  $scope.assignmentsTab = true;
  $scope.studentsTab = false;
  $scope.submissionsTab = false;

  var tabNames = ['assignmentsTab', 'studentsTab', 'submissionsTab'];

  $scope.showTab = function (view) {
    tabNames.forEach(function (tabName) {
      if(tabName === view) {
        $scope[tabName] = true;
      } else {
        $scope[tabName] = false;
      }
    });
  };

  // These are the field names for the assignments table.
  var fieldNames = {'name': false, 'creationDate': false,
    'deadline': false, 'numOfTestCases': false, 'totalScore': false,
    'numOfSubmissions': false
  };

  $scope.predicate = 'name';
  $scope.reverseOrder = fieldNames[$scope.predicate];

  $scope.toggleOrder = function(field) {
    Object.keys(fieldNames).forEach(function(fieldName) {
      if (fieldName === field) {
        $scope.predicate = field;
        fieldNames[field] = !fieldNames[field];
        $scope.reverseOrder = fieldNames[field];
      } else {
        fieldNames[fieldName] = false;
      }
    });
  };

  // This is the logic for sorting the students table, which can only be
  // sorted by students for now.
  $scope.studentReverseOrder = false;
  $scope.toggleStudentOrder = function() {
    $scope.studentReverseOrder = !$scope.studentReverseOrder;
  };
  
  // This is the logic for sorting the submissions table...
  var submissionFieldNames = {'hash': false, 'student': false, 'assignment': false,
      'submitDate': false, 'verdict': false, 'elapsedTime': false, 'score': false,
      'tests': false
  };

  $scope.submissionPredicate = 'student';
  $scope.submissionReverseOrder =
      submissionFieldNames[$scope.submissionPredicate];

  $scope.toggleSubmissionOrder = function(field) {
    Object.keys(submissionFieldNames).forEach(function(fieldName) {
      if (fieldName === field) {
        $scope.submissionPredicate = field;
        submissionFieldNames[field] = !submissionFieldNames[field];
        $scope.submissionReverseOrder = submissionFieldNames[field];
      } else {
        submissionFieldNames[fieldName] = false;
      }
    });
  };

  // TODO(samuel): The predicates MUST BE FIXED in the html page, since they
  // are not matching the correct object attributes. The user.firstName and
  // user.lastNames will need to be flatten into submissions.

  // TODO(samuel): Add filtering for the submissions.

  // Course editing:
  $scope.toggleEditCourseModal = function() {
    $('#editCourseModal').modal();
  };

  
  $scope.editCourse = function () {
    // Everything here is editable, except the course grader.
    var errors = {
      name: false,
      code: false,
      year: false,
      semester: false
    };

    if (!course.name) {
      errors.name = true;
    }

    var coursePattern = /[A-Za-z]{4}[0-9]{4}/;
    if (!course.code || !course.code.match(coursePattern)) {
      errors.code = true;
    }

    if (!course.year || !parseInt(course.year)) {
      errors.year = true;
    }

    var semesterPattern = /^fall$|^spring$|^summer$/i;
    if (!course.semester || !course.semester.match(semesterPattern)) {
      errors.semester = true;
    }

    var errorMessages = [];
    for (var errorType in errors) {
      if (errors[errorType]) {
        switch (errorType) {
          case 'name':
            errorMessages.push('Enter a valid course name.');
            break;
          case 'code':
            errorMessages.push('Enter a 4 letter and 4 digit course code.');
            break;
          case 'year':
            errorMessages.push('Select a valid year.');
            break;
          case 'semester':
            errorMessages.push('Select a valid session.');
            break;
          default:
            break
        }
      }
    }

    if (errorMessages.length > 0) {
      // We had errors. Display them and abort.
      // We are also pretty lazy, so to revert the course information, we just
      // redownload the course information.
      $scope.cancelEditCourse();
      $rootScope.showGenericErrorModal('Invalid course information',
          errorMessages);
      return;
    }

    $http.put('/api/courses/' + course._id, {
      name: course.name,
      code: course.code,
      year: course.year,
      semester: course.semester
    })
    .success(function() {
      $('#editCourseModal').modal('hide');
    }).error(function() {

    });
  };

  $scope.cancelEditCourse = function() {
    // We are extremely lazy, so just dismiss the modal and refresh the course
    // info.
    $('#editCourseModal').modal('hide');
    $scope.refreshUser();
  };

  // This is needed so that the new assignment actually binds to this course.
  ($rootScope.setInitialCourse = function() {
    $rootScope.newAssignment.course = course;
  })();

  $scope.showRepository = function(repoId) {
    // wiii
    $rootScope.initFileSystem(repoId);
    $('#repositoryModal').modal();
  };

  $scope.hideRepositoryModal = function() {
    $('#repositoryModal').modal('hide');
  };

  // This is the logic for sorting the students table
  var studentFieldNames = {'name': false, 'email': false};

  $scope.studentPredicate = 'name';
  $scope.studentReverseOrder =
      studentFieldNames[$scope.studentPredicate];

  $scope.toggleStudentOrder = function(field) {
    Object.keys(studentFieldNames).forEach(function(fieldName) {
      if (fieldName === field) {
        $scope.studentPredicate = field;
        studentFieldNames[field] = !studentFieldNames[field];
        $scope.studentReverseOrder = studentFieldNames[field];
      } else {
        studentFieldNames[fieldName] = false;
      }
    });
  };

  // Code for emailing all students in the course.
  $scope.emailToAllStudents = {};
  $scope.toggleEmailStudentsModal = function() {
    $('#emailAllStudentsModal').modal();
  };

  $scope.hideEmailStudentsModal = function() {
    $('#emailAllStudentsModal').modal('hide');
  };

  /**
   * Send message to all students.
   */
  $scope.emailAllStudents = function(email) {
    // Too lazy to error check.
    if (!email.subject) {
      email.subject = '[No subject]';
    }

    if (!email.message) {
      email.message = '[No message]';
    }

    $http.post('/api/courses/' + course._id + '/broadcast', {
      subject: email.subject,
      message: email.message
    }).success(function() {
      $scope.hideEmailStudentsModal();
      $scope.emailToAllStudents = {};
      $rootScope.showGenericErrorModal('Email sent', ['The email was sent ' +
          'successfully']);
    }).error(function() {
      $scope.hideEmailStudentsModal();
      $rootScope.showGenericErrorModal('Error sending email', ['There was an ' +
          'error sending the email. Please try again later.']);
    });
  };

}]);
