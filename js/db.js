//Database manager for mongo labs
app.factory("db", ["$http", function($http) {
	var _dbName = "projectmanager";
	var _urlStart = "https://api.mongolab.com/api/1/databases/" + _dbName + "/";
	var _urlEnd = "?apiKey=" + settings.mongoApiKey;

	var urls = {
		numLoaded: _urlStart + "collections/numLoaded/1" + _urlEnd,
		users: _urlStart + "collections/users" + _urlEnd,
		runCommand: _urlStart + "runCommand" + _urlEnd
	};

	function _incNumLoaded(number) {
		$http.put(urls.numLoaded, {
			"x": number
		}).success(function(response) {
			console.log("Response incNumLoaded: ");
			console.log(response);
		});
	}

	var module = {};
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
			_incNumLoaded(result+1);
		});
	};
	module.createUser = function(user, callback) {
		console.log("createUser: " + urls.users);
		$http.post(urls.users, user)
		.success(function(response) {
			console.log("Response createUser:");
			console.log(response);
			callback(response);
		}).error(function(response) {
			console.log(response);
		});
	};
	module.login = function(user, callback) {
		var query = {
			"email": user.email, 
			"password": user.password
		};
		var url = urls.users + "&q=" + JSON.stringify(query) + "&fo=true";
		console.log("login: " + url);
		$http.get(url)
		.success(function(response) {
			console.log("Response login:");
			console.log(response);
			callback(response);
		});
	};


	return module;
}]);