app.directive("cursor", function() {
	var directive = {};

	directive.restrict = "E";
	directive.compile = function(element, attributes) {
		//called once
		var linkFunction = function($scope, element, attributes) {
			//called to do data binding
			$scope.$watch(function(scope) {return $scope.selectedItem}, function(newValue, oldValue) {
				if (newValue === undefined) 
					return;
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

				if (newSelectedDomElem) {
					var insertBeforeElem = (newSelectedDomElem.tagName == "BUTTON") 
											? newSelectedDomElem 
											: newSelectedDomElem.children[0].children[0];
					$("#cursor").insertBefore( insertBeforeElem );
				}	

				var $cursor = $("#cursor");
				if (!isElementInViewport($cursor)) {
					$cursor[0].scrollIntoView();
				}
			});
			element.html('<i class="fa fa-play"></i>');
		}

		return linkFunction;

	};

	return directive;
});

function isElementInViewport (el) {

    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}
