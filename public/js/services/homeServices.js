services.factory('HomeData', ['$resource', function($resource) {
  return $resource('/api/home');
}]);

services.factory('HomeDataLoader', ['HomeData', '$q',
    function(HomeData, $q) {
  return function() {
    var delay = $q.defer();
    HomeData.get({}, function(homeData) {
      delay.resolve(homeData);
    }, function() {
      delay.reject('Unable to fetch home data.');
    });
    return delay.promise;
  };
}]);
