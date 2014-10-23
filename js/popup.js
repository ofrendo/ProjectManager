app.controller("popup", ["$scope", "ngDialog", function($scope, ngDialog) {
	if (localStorage.getItem("email") !== "null" && localStorage.getItem("email") !== null) {
		$scope.user = {
			name: "Oliver",
			email: localStorage.getItem("email"),
			password: localStorage.getItem("password"),
			/*password2: "oliver94"*/
		}
	}

	$scope.onSignupSubmit = function() {
		if (_validateSubmit() === true) {
			$scope.$parent.submitSignup($scope.user);
			ngDialog.close();
		}
	};

	if (localStorage.getItem("remember") == "true") {
		$scope.remember = true;
	}
	$scope.onLoginSubmit = function() {
		if ($scope.remember === true) {
			localStorage.setItem("email", $scope.user.email);
			localStorage.setItem("password", $scope.user.password);
		}
		else {
			localStorage.removeItem("email");
			localStorage.removeItem("password");
		}
		localStorage.setItem("remember", $scope.remember);
		$scope.$parent.submitLogin($scope.user);
		ngDialog.close();
	};


	function _validateSubmit() {
		return true;
	}


	//$scope.projects = $scope.$parent.projects
	$scope.project = { name: "ProjectName" };
	$scope.onProjectSubmit = function() {
		$scope.$parent.submitProject($scope.project);
		ngDialog.close();
	};


	if ($scope.$parent.updateItem === true) {
		//Item update
		$scope.popupTitle = "Update item";
		$scope.submitButtonTitle = "Update";
		$scope.item = JSON.parse(JSON.stringify($scope.$parent.selectedItem));
		$scope.itemSubmitFunction = onUpdateItemSubmit;
	}
	else if ($scope.$parent.selectedProject) {
		//Item creation
		$scope.popupTitle = "Create item";
		$scope.submitButtonTitle = "Create";
		$scope.item = {
			description: "Description for item"
		};
		$scope.itemSubmitFunction = onCreateItemSubmit;

		if ($scope.$parent.createChild === true) { //($scope.$parent.selectedPreviousItem || $scope.$parent.selectedNextItem) {
			//Item child creation
			$scope.item.parentItemID = ($scope.$parent.selectedParentItem) ? $scope.$parent.selectedParentItem._id.$oid : "root";
			$scope.item.nextItemID = null;
		}
		else {
			//Item sibling creation
			var validItem = $scope.$parent.selectedPreviousItem || $scope.$parent.selectedNextItem;
			$scope.item.parentItemID = validItem.parentItemID;
			$scope.item.nextItemID = ($scope.$parent.selectedNextItem) ? $scope.$parent.selectedNextItem._id.$oid : null;			
		}
	}

	function onCreateItemSubmit() {
		$scope.$parent.submitCreateItem($scope.selectedProject, $scope.item, $scope.$parent.selectedPreviousItem);
		ngDialog.close();
	};
	function onUpdateItemSubmit() {
		$scope.$parent.submitUpdateItem($scope.$parent.selectedItem, 
										$scope.item.description, 
										$scope.item.priority);
		ngDialog.close();
	};


}]);