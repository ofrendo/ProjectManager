//Database manager for mongo labs
app.factory("db", ["$http", function($http) {
	var _dbName = "projectmanager";
	var _urlStart = "https://api.mongolab.com/api/1/databases/" + _dbName + "/";
	var _urlEnd = "?apiKey=" + settings.mongoApiKey;

	var urls = {
		numLoaded: _urlStart + "collections/numLoaded" + _urlEnd
	};

	function _load(url, data, type, success, error) {

	}

	var module = {};
	module.incNumLoaded = function(callback) {
		$http.post(urls.numLoaded, {
			$inc: { x: 1 }
		}).success(function(response) {
			console.log("Response: ");
			console.log(response);
		});
	};
	module.loadNumLoaded = function(callback) {
		$http.get(urls.numLoaded)
		.success(function(response) {
			callback(response[0].x);
		});
	};

	return module;
}]);