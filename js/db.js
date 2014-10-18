//Database manager for mongo labs
app.factory("db", ["$http", function($http) {
	var _dbName = "projectmanager";
	var _urlStart = "https://api.mongolab.com/api/1/databases/" + _dbName + "/";
	var _urlEnd = "?apiKey=" + settings.mongoApiKey;

	var urls = {
		numLoaded: _urlStart + "collections/numLoaded/1" + _urlEnd
	};

	function _load(url, data, type, success, error) {

	}

	var module = {};
	module.incNumLoaded = function(number) {
		$http.put(urls.numLoaded, {
			"x": number
		}).success(function(response) {
			console.log("Response incNumLoaded: ");
			console.log(response);
		});
	};
	module.loadNumLoaded = function(callback) {
		$http.get(urls.numLoaded)
		.success(function(response) {
			console.log("Response loadNumLoaded: ");
			console.log(response);
			var result = response.x;
			if (result === undefined) {
				result = 0;
			}
			callback(result);
			incNumLoaded(result+1);
		});
	};

	return module;
}]);