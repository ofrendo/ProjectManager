app.controller("main", ["$scope", "$http", "db", function($scope, $http, db) {
    $scope.numLoaded = 0;

    db.incNumLoaded(function() {
    	db.loadNumLoaded(function(result) {
			$scope.numLoaded = result;
    	});
    });
}]);