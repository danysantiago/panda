/**
 * This is the controller for the professor's individual assignment view.
 */

pandaApp.controller('ProfessorAssignmentController', ['$scope', 'currentUser',
    'assignment', '$http', 'formDataObject', 'Assignment', '$rootScope',
        function($scope, currentUser, assignment, $http, formDataObject,
            Assignment, $rootScope) {
  $scope.assignment = assignment;
  $scope.isDefined = angular.isDefined;

  var refreshUser = function() {
    // Actually, refresh assignment
      Assignment.get({id: assignment._id, submissions: true},
        function(data) {
      // success
      $scope.assignment = data;
      }, function() {
      // error
    });
  };


  // assignment.submissions.forEach(function(submission) {
  //   // Failed submissions have no tests.
  //   var submissionCpuTime = 0.0;
  //   if (submission.tests) {
  //     submission.tests.forEach(function(test) {
  //       submissionCpuTime += parseFloat(test.result['cpu usage']);
  //     });
  //   }
  //   submission.cpuTime = submissionCpuTime + ' seconds';
  // });
  assignment.submissions.forEach(function(submission) {
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

  $scope.toggleTestCaseModal = function() {
    $('#addTestCaseModal').modal();
  };

  $scope.infoTab = true;
  $scope.submissionsTab = false;
  $scope.testCasesTab = false;

  var tabNames = ['infoTab', 'submissionsTab', 'testCasesTab'];

  $scope.showTab = function (view) {
    tabNames.forEach(function (tabName) {
      if(tabName === view) {
        $scope[tabName] = true;
      } else {
        $scope[tabName] = false;
      }
    });
  };

  $scope.toggleEditAssignmentModal = function() {
    $('#editAssignmentModal').modal();
  };

  var instructionsFile = null;
  $scope.onInstructionsFileSelect = function($files) {
    instructionsFile = $files[0];
    $scope.assignment.Instructions = {file: {name: instructionsFile.name}};
  };

  $scope.editAssignment = function() {
    var putData = {};

    var errors = {
      description: false,
      deadline: false,
      tries: false,
      instructionFile: false
    };

    // Description
    if (!assignment.shortDescription) {
      errors.description = true;
    }

    // Deadline
    if (!$rootScope.datePickerElement) {
      // No date was selected, ever.
      // This is not actually an error, just don't update put data info.
    } else {
      assignment.deadline =
      $rootScope.datePickerElement.datepicker('getFormattedDate');

      var today = new Date((new Date()).toLocaleDateString());
      if (!assignment.deadline ||
          (new Date(assignment.deadline)) < today) {
        errors.deadline = true;
      }

      // Everything went well for the deadline here.
      if(!errors.deadline) {
        putData.deadline = assignment.deadline;
      }
    }

    // Tries
    if (!parseInt(assignment.numOfTries) ||
        parseInt(assignment.numOfTries) < 1) {
      errors.tries = true;
    }

    // Instructions
    if (!instructionsFile) {
      // This is not actually an error... just don't include the assignment.
    } else {
      putData.instructions = instructionsFile;
    }

    // Error check for these happens later.
    putData.shortDescription: assignment.shortDescription;
    putData.numOfTries: assignment.numOfTries;

    // If there is any errors, then show the error messages and return.
    var errorMessages = [];
    for (var errorType in errors) {
      if (errors[errorType]) {
        switch(errorType) {
          case 'description':
            errorMessages.push('Enter a description.');
            break;
          case 'deadline':
            errorMessages.push('Enter a valid deadline date.');
            break;
          case 'tries':
            errorMessages.push('Enter a valid number of tries.');
            break;
          case 'instructionFile':
            errorMessages.push('Select a valid instruction file.');
            break;
          default:
            break;
        }
      }
    }

    if (errorMessages.length > 0) {
      // There were errros. Display them and abort.
      $rootScope.showGenericErrorModal('Invalid assignment information',
          errorMessages);
      return;
    }

    // Everything went well.
    $http({
      method: 'PUT',
      url: '/api/assignments/' + assignment._id,
      headers: {
        'Content-Type': undefined // Undefined will make angular insert correct
        // content-type.
      },
      data: putData,
      transformRequest: formDataObject
    }).success(function() {
      $('#editAssignmentModal').modal('hide');
    }).error(function() {
      $rootScope.showGenericErrorModal('Invalid assignment information',
        ['Please verify your uploaded files are of the supported file types.',
        'Instructions can be uploaded in PDF files.']);
    });
  };

  $scope.cancelEditAssignment = function() {
    // We are extremely lazy, so just dismiss the modal and refresh the info.
    $('#editAssignmentModal').modal('hide');
    refreshUser();
  };

  // Adding test case stuff

  $scope.newTestCase = {
    testInputText: '',
    testOutputText: '',
    testInputFile: null,
    testOutputFile: null,
    testerFile: null,
    timeLimit: 10,
    memLimit: 32768,
    score: 0,
    type: 'I/O'
  };

  $scope.onTestOutputFileSelect = function($files) {
    if ($files.length > 0) {
      $scope.newTestCase.testOutputFile = $files[0];
    } else {
      $scope.newTestCase.testOutputFile = null;
    }
  };

  $scope.onTestInputFileSelect = function($files) {
    if ($files.length > 0) {
      $scope.newTestCase.testInputFile = $files[0];
    } else {
      $scope.newTestCase.testInputFile = null;
    }
  };

  $scope.onTesterFileSelect = function($files) {
    if ($files.length > 0) {
      $scope.newTestCase.testerFile = $files[0];
    } else {
      $scope.newTestCase.testerFile = null;
    }
  };

  $scope.createTestCase = function(newTestCase) {
    var errors = {
      score: false,
      timeLimit: false,
      memoryLimit: false,
      testInput: false,
      testOutput: false,
      testerFile: false
    };

    // All validation checks.
    if (!parseInt(newTestCase.score) || parseInt(newTestCase.score) < 1) {
      errors.score = true;
    }

    if (!parseInt(newTestCase.timeLimit) ||
        parseInt(newTestCase.timeLimit) < 1) {
      errors.timeLimit = true;
    }

    if (!parseInt(newTestCase.memLimit) || parseInt(newTestCase.memLimit) < 1) {
      errors.memoryLimit = true;
    }

    if (newTestCase.type === 'I/O' && (
        newTestCase.testInputFile === null && !newTestCase.testInputText)) {
      errors.testInput = true;
    }

    if (newTestCase.testOutputFile === null && !newTestCase.testOutputText) {
      errors.testOutput = true;
    }

    if (newTestCase.type === 'Exec' && newTestCase.testerFile === null) {
      errors.testerFile = true;
    }

    // End validation checks...
    // Now throw errors in case.
    var errorMessages = [];
    for (var errorType in errors) {
      if (errors[errorType]) {
        switch (errorType) {
          case 'score':
            errorMessages.push('Enter a valid score.');
            break;
          case 'timeLimit':
            errorMessages.push('Enter a valid time limit.');
            break;
          case 'memoryLimit':
            errorMessages.push('Enter a valid memory limit.');
            break;
          case 'testInput':
            errorMessages.push('Enter either a valid input file or valid ' +
                'input text.');
            break;
          case 'testOutput':
            errorMessages.push('Enter either a valid output file or valid ' +
                'ouput text.');
            break;
          case 'testerFile':
            errorMessages.push('Enter a valid tester file.');
            break;
          default:
            break;
        }
      }
    }

    if (errorMessages.length > 0) {
      // We had errors. Display them and abort.
      $rootScope.showGenericErrorModal('Invalid test case information',
          errorMessages);
      return;
    }

    var postTestCase = {};
    /*
    if (newTestCase.testInputFile === null) {
      postTestCase.testInput = newTestCase.testInputText;
    } else {
      postTestCase.testInput = newTestCase.testInputFile;
    }

    if (newTestCase.testOutputFile === null) {
      postTestCase.testOutput = newTestCase.testOutputText;
    } else {
      postTestCase.testOutput = newTestCase.testOutputFile;
    }
    */
    // Quick fix for bug. If a user selects an invalid file and then changes
    // his/her mind and tries to input text, the modal will keep giving an
    // an error.
    // Prefer text input over text file upload
    if (newTestCase.testInputText) {
      postTestCase.testInput = newTestCase.testInputText;
    } else {
      postTestCase.testInput = newTestCase.testInputFile;
    }

    if (newTestCase.testOutputText) {
      postTestCase.testOutput = newTestCase.testOutputText;
    } else {
      postTestCase.testOutput = newTestCase.testOutputFile;
    }

    postTestCase.testerFile = newTestCase.testerFile;
    postTestCase.timeLimit = parseInt(newTestCase.timeLimit);
    postTestCase.memLimit = parseInt(newTestCase.memLimit);
    postTestCase.score = newTestCase.score;

    $http({
      method: 'POST',
      url: 'api/assignments/' + assignment._id + '/test',
      headers: {
        'Content-Type': undefined
      },
      data: postTestCase,
      transformRequest: formDataObject
    }).success(function() {
      $('#addTestCaseModal').modal('hide');

      // refresh this here.
      refreshUser();
    }).error(function() {
      // Oh noes
      $rootScope.showGenericErrorModal('Invalid test case information',
        ['Please verify your uploaded files are of the supported file types.',
        'Input and output files can be uploaded in plaintext files.',
        'Tester file can be uploaded in .java.']);
    });
  };

  var testCaseIdToRemove = null;

  $scope.removeTestCase = function() {
    if (!testCaseIdToRemove) {
      // User tried to access this function by other means.
      return;
    }

    var testCaseId = testCaseIdToRemove;
    var url = '/api/assignments/' + assignment._id + '/test/' + testCaseId;
    $http.delete(url).success(function() {
      refreshUser();
      $('#removeTestCaseModal').modal('hide');
    }).error(function() {
      // Woah
      $rootScope.showGenericErrorModal('Test case could not be removed.');
    });
  };

  $scope.toggleRemoveTestCaseModal = function(testCaseId) {
    testCaseIdToRemove = testCaseId;
    $('#removeTestCaseModal').modal();
  };

  $scope.cancelRemoveTestCase = function() {
    testCaseIdToRemove = null;
    $('#removeTestCaseModal').modal('hide');
  };

  $scope.showRepository = function(repoId) {
    // wiii
    $rootScope.initFileSystem(repoId);
    $('#repositoryModal').modal();
  };

  $scope.hideRepositoryModal = function() {
    $('#repositoryModal').modal('hide');
  };

  var submissionToEdit = null;
  $scope.toggleEditScoreModal = function(submission) {
    submissionToEdit = submission;
    $('#editScoreModal').modal();
  };

  $scope.hideEditScoreModal = function() {
    $('#editScoreModal').modal('hide');
  };

  // submissions/:id/score/ PUT:
  // payload: score
  $scope.editSubmissionScore = 0;
  $scope.editScore = function(score) {
    if ((!parseInt(score) && score != 0) || score < 0) {
      $rootScope.showGenericErrorModal('Error Changing Score', ['The score ' +
          'must be a positive integer.']);
      return;
    }

    if (score > submissionToEdit.totalScore) {
      $rootScope.showGenericErrorModal('Error Changing Score', ['The score ' +
          'must not exceed the maximum score of the assignment.']);
      return;
    }

    $http.put('/api/submissions/' + submissionToEdit._id + '/score',
        {score: score}).success(function() {
      // success
      refreshUser();
      $scope.editSubmissionScore = 0;
      $scope.hideEditScoreModal();
      $rootScope.showGenericErrorModal('Score changed successfully.',
          ['The score has been changed successfully.']);
    }).error(function() {
      $rootScope.showGenericErrorModal('Error Changing Score.', ['Error']);
    });
  };

  // sorting the submissions table
  // This is the logic for sorting the submissions table...
  var submissionFieldNames = {'student': false, 'assignment': false,
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
}]);
