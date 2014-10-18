//Database manager for mongo labs
app.factory("db", ["$http", function($http) {
	var _dbName = "projectmanager";
	var _urlStart = "https://api.mongolab.com/api/1/databases/" + _dbName + "/";
	var _urlEnd = "?apiKey=" + settings.mongoApiKey;

	function _load(data, type, success, error) {
		$j
	}

	var module = {};
	module.loadNumLoaded = function(callback) {
		$http.get(_urlStart + "collections/numLoaded" + _urlEnd)
		.success(function(response) {
			callback(response[0].x);
		});
	}

	return module;
}]);