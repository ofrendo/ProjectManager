app.controller("popup", ["$scope", "ngDialog", function($scope, ngDialog) {
	$scope.user = {
		name: "Oliver",
		email: "ofrendo@gmail.com",
		password: "oliver94",
		password2: "oliver94"
	};
	$scope.onSignupSubmit = function() {
		if (_validateSubmit() === true) {
			$scope.$parent.submitSignup($scope.user);
			ngDialog.close();
		}
	};
	$scope.onLoginSubmit = function() {
		if ($scope.remember === true) {
			localStorage.setItem("email", $scope.user.email);
			localStorage.setItem("password", $scope.user.password);
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

	$scope.item = { 
		projectID: (!!$scope.$parent.selectedProject) 
							? $scope.$parent.selectedProject._id.$oid
							: null,
		parentItemID: (!!$scope.$parent.selectedItem) 
							? $scope.$parent.selectedItem._id.$oid
							: "root",
		description: "Description for item"
	};
	$scope.onCreateItemSubmit = function(){
		$scope.$parent.submitCreateItem($scope.selectedProject, $scope.item);
		ngDialog.close();
	};


}]);