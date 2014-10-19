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
}]);