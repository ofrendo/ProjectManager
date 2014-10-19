app.controller("main", ["$scope", "$http", "db", "ngDialog", function($scope, $http, db, ngDialog) {
    var _menuTitle = "Personal project manager";
    $scope.menuTitle = _menuTitle;
    $scope.loggedIn = false;
    $scope.numLoaded = "Loading...";
    $scope.user = {};

	//Event functions
	$scope.onSignupClick = function() {
		ngDialog.open({ 
			template: "templateSignup",
			controller: "popup",
			scope: $scope
		});
	};
	$scope.onLoginClick = function() {
		ngDialog.open({
			template: "templateLogin",
			controller: "popup",
			scope: $scope
		});
	};
	$scope.onLoginSuccess = function(user) {
		$scope.user = user;
		$scope.menuTitle = user.name + "'s projects";
		$scope.loggedIn = true;
	};
	$scope.onLogoutClick = function() {
		$scope.user = {};		
		$scope.menuTitle = _menuTitle;
		$scope.loggedIn = false;
	}

	//Sending methods
	$scope.submitSignup = function(user) {
		user = $scope.prepareUserData(user);
		console.log(user);
		db.createUser(user, function(response) {
			$scope.onLoginSuccess(response);
		});
	};
	$scope.submitLogin = function(user) {
		db.login($scope.prepareUserData(user), function(response) {
			$scope.onLoginSuccess(response);
		});
	};

	//Utility methods
	$scope.prepareUserData = function(user) {
		if (user.projects === undefined) {
			user.projects = [];
		}
		delete user["password2"];
		user.password = CryptoJS.SHA256(user.password).toString();
		return user;
	}

    //On load
	db.loadNumLoaded(function(result) {
		$scope.numLoaded = result+1;
	});
	$scope.remember = localStorage.getItem("remember") == "true";
	$scope.user.email = localStorage.getItem("email");
	$scope.user.password = localStorage.getItem("password");

	if ($scope.remember === true) {
		$scope.submitLogin($scope.user);
	}
}]);