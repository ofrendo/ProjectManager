app.controller("main", ["$scope", "$http", "db", "ngDialog", function($scope, $http, db, ngDialog) {
    var _menuTitle = "Personal project manager";
    $scope.menuTitle = _menuTitle;
    $scope.loggedIn = false;
    $scope.numLoaded = "Loading...";
    $scope.user = {};
    $scope.projects = [];

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

		//Load user's projects
		db.loadProjects($scope.user, function(response) {
			//Load projects first
			for (var i = 0; i < response.length; i++) {
				if (response[i].projectID === "root") {
					response[i].items = [];
					$scope.projects.push(response[i]);
				}
			}

			//Associate root level items with projects
			for (var i = 0; i < $scope.projects.length; i++) {
				for (var j = 0; j < response.length; j++) {
					if ($scope.projects[i]._id.$oid === response[j].projectID
						 && response[j].parentItemID === "root") {

						response[j].items = [];
						$scope.projects[i].items.push(response[j]);
					}
				}
			}

			//Create hierachy by associating items with their parent items
			for (var i = 0; i < response.length; i++) {
				if (response[i].projectID !== "root") {
					var item = response[i];
					if (item.parentItemID !== "root") {
						//Find the item this item is the child of
						for (var j = 0; j < response.length; j++) {
							if (item.parentItemID == response[j]._id.$oid) {
								item.items = [];
								response[j].items.push(item);
							}
						}
					}
				}
			}

		});
	};
	$scope.onLogoutClick = function() {
		$scope.user = {};		
		$scope.menuTitle = _menuTitle;
		$scope.loggedIn = false;
		$scope.projects = [];
	};
	$scope.onCreateProjectClick = function() {
		ngDialog.open({
			template: "templateProject",
			controller: "popup",
			scope: $scope
		});
	};
	$scope.onCreateItemClick = function(project, item) {
		$scope.selectedProject = project;
		$scope.selectedItem = item;
		ngDialog.open({
			template: "templateItem",
			controller: "popup",
			scope: $scope
		});
	};

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
			if (response._id) {
				$scope.onLoginSuccess(response);
			}
		});
	};

	$scope.submitProject = function(project) {
		$scope.prepareItem(project, "root");
		db.createProject(project, function(response) {
			$scope.projects.push(response);
			console.log($scope.projects);
		});
	};
	$scope.submitCreateItem = function(project, item) {
		$scope.prepareItem(item, project._id.$oid);
		db.createItem(item, function(response) {
			addItemToProject(project, response);
		});
	}

	//Utility methods
	$scope.prepareUserData = function(user) {
		//if (user.projects === undefined) {
		//	user.projects = [];
		//}
		delete user["password2"];
		user.password = CryptoJS.SHA256(user.password).toString();
		return user;
	};
	$scope.prepareItem = function(item, projectID) {
		item.created = (new Date()).toString();
		item.lastModified = (new Date()).toString();
		item.status = "Not done";
		item.projectID = projectID;
		item.userID = $scope.user._id.$oid;
	};

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

	//add item to project recursively
	function addItemToProject(parentItem, item) {
		if (parentItem._id.$oid == item.parentItemID || item.parentItemID == "root") {
			if (!parentItem.items) parentItem.items = [];
			parentItem.items.push(item);
			return;
		}

		for (var i = 0; i < parentItem.items.length; i++) {
			addItemToProject(parentItem.items[i], item);
		}
	}
}]);