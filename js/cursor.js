app.directive("cursor", function() {
	var directive = {};

	directive.restrict = "E";
	directive.compile = function(element, attributes) {
		//called once
		var linkFunction = function($scope, element, attributes) {
			//called to do data binding
			$scope.$watch(function(scope) {return $scope.selectedItem}, function(newValue, oldValue) {
				//On change of selectedItem
				//Find li element that this is the model of
				var newSelectedDomElem;
				$(".projectRootButton, li.projectItemLi").each(function() {
					if (newValue._id.$oid == $(this).attr("data-itemID")) {
						newSelectedDomElem = this;
					}
				});

				if (!newSelectedDomElem) { //On first load data-itemID won't be loaded
					newSelectedDomElem = $(".projectRootButton")[0];
				}

				//var cursorElem = $("#cursor")[0];
				/*if (!newSelectedDomElem) 
					return;*/
				if (newSelectedDomElem) {
					var insertBeforeElem = (newSelectedDomElem.tagName == "BUTTON") 
											? newSelectedDomElem 
											: newSelectedDomElem.children[0].children[0];
					$("#cursor").insertBefore( insertBeforeElem );
				}

				//console.log(newValue);
				//console.log(newSelectedDomElem);
			});

			element.html('<i class="fa fa-play"></i>');
		}

		return linkFunction;

	};

	return directive;
});