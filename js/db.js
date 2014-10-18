//Database manager for mongo labs
app.factory("db", ["$http", function($http) {
	var _dbName = "projectmanager";
	var _urlStart = "https://api.mongolab.com/api/1/databases/" + _dbName + "/";
	var _urlEnd = "?apiKey=" + settings.mongoApiKey;

	var urls = {
		numLoaded: _urlStart + "collections/numLoaded/5442ec5de4b00975f8618845" + _urlEnd
	};

	function _load(url, data, type, success, error) {

	}

	var module = {};
	module.incNumLoaded = function(callback) {
		$http.put(urls.numLoaded, {
			$inc: { x: 1 }
		}).success(function(response) {
			console.log("Response incNumLoaded: ");
			console.log(response);
			callback(response);
		});
	};
	module.loadNumLoaded = function(callback) {
		$http.get(urls.numLoaded)
		.success(function(response) {
			console.log("Response loadNumLoaded: ");
			console.log(response);
			callback(response);
		});
	};

	return module;
}]);