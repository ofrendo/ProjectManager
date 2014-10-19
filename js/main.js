app.controller("main", ["$scope", "$http", "db", function($scope, $http, db) {
    $scope.numLoaded = "Loading...";

	db.loadNumLoaded(function(result) {
		$scope.numLoaded = result+1;
	});	
}]);