/**
 * This is the controller for the professor's individual assignment view.
 */

pandaApp.controller('ProfessorAssignmentController', ['$scope', 'currentUser',
    'assignment', '$http', 'formDataObject', function($scope, currentUser,
        assignment, $http, formDataObject) {
  $scope.assignment = assignment;
  $scope.isDefined = angular.isDefined;

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
  
  $scope.testCaseType = 'I/O';

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
    timeLimit: 5,
    memLimit: 1024,
    score: 0
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

  $scope.createTestCase = function() {
    var newTestCase = $scope.newTestCase;
    var postTestCase = {};
    if ($scope.newTestCase.testInputFile === null) {
      postTestCase.testInput = newTestCase.testInputText;
    } else {
      postTestCase.testInput = newTestCase.testInputFile;
    }

    if ($scope.newTestCase.testOutputFile === null) {
      postTestCase.testOutput = newTestCase.testOutputText;
    } else {
      postTestCase.testOutput = newTestCase.testOutputFile;
    }

    postTestCase.testerFile = newTestCase.testerFile;
    postTestCase.timeLimit = newTestCase.timeLimit;
    postTestCase.memLimit = newTestCase.memLimit;
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
    }).error(function() {
      // Oh noes
    });
  };

}]);
