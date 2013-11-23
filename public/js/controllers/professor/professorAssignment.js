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
    $scope.assignment = Assignment.get({id: assignment._id, submissions: true},
        function() {
      // success
      }, function() {
      // error
    });
  };

  assignment.submissions.forEach(function(submission) {
    // Failed submissions have no tests.
    var submissionCpuTime = 0.0;
    if (submission.tests) {
      submission.tests.forEach(function(test) {
        submissionCpuTime += parseFloat(test.result['cpu usage']);
      });
    }
    submission.cpuTime = submissionCpuTime + ' seconds';
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
    var putData = {
      name: assignment.name,
      shortDescription: assignment.shortDescription,
      deadline: assignment.deadline,
      numOfTries: assignment.numOfTries,
      Instructions: instructionsFile
    };

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

    });
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

}]);
