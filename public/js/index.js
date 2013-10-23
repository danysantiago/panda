pandaApp.controller('IndexController', ['$scope', 'loginCheck',
    function($scope, loginCheck) {
      $scope.user = {'loggedIn': loginCheck};
}]);
