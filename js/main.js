app.controller("main", ["$scope", "$http", "db", "ngDialog", function($scope, $http, db, ngDialog) {
    var _menuTitle = "Personal project manager";
    $scope.menuTitle = _menuTitle;
    $scope.loggedIn = false;
    $scope.numLoaded = "Loading...";
    $scope.user = {};
    $scope.projects = [];

    $scope.sortableOptions = {
    	update: function(e, ui) {
    		var originalItems = ui.item.sortable.droptargetModel;
    		var originalIndex = ui.item.sortable.index;
    		var newIndex = ui.item.sortable.dropindex;

    		//Items that need to be updated:
    		//The originalPreviousItem
    		//The newPreviousItem
    		var originalPreviousItem = originalItems[ originalIndex-1 ];
    		var draggedItem = originalItems[ originalIndex ];
    		var newPreviousItem = (newIndex > originalIndex) ? originalItems[ newIndex ] : originalItems[ newIndex-1 ];
    		var newNextItem = (newIndex != originalItems.length-1) ? originalItems[ newIndex ] : null;

    		if (originalPreviousItem) {
    			//Need to find the new nextItemID for this item
    			var localNewNextItem = originalItems[ originalItems+1 ];
    			var newNextItemID = (localNewNextItem) ? localNewNextItem._id.$oid : null;

    			db.updateItemNextItemID(originalPreviousItem, newNextItemID, function() {
    				originalPreviousItem.nextItemID = newNextItemID;
    			});
    		}

    		if (newPreviousItem) {
    			//New next item for this will be the item being dragged
    			db.updateItemNextItemID(newPreviousItem, draggedItem._id.$oid, function() {
    				newPreviousItem.nextItemID = draggedItem._id.$oid;
    			})
    		}

    		//Finally update the item itself
    		var newNextItemID = (newNextItem) ? newNextItem._id.$oid : null;
    		db.updateItemNextItemID(draggedItem, newNextItemID, function() {
    			draggedItem.nextItemID = newNextItemID;
			});	

    	},
    	index: 0
    };

	//Event functions
	$scope.onSignupClick = function() {
		resetItems();
		ngDialog.open({ 
			template: "templateSignup",
			controller: "popup",
			scope: $scope
		});
	};
	$scope.onLoginClick = function() {
		resetItems();
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

			for (var i = 0; i < $scope.projects.length; i++) {
				orderItems($scope.projects[i]);
			}

		});
	};

	function orderItems(parentItem) {
		if (parentItem.items.length === 0) {
			return;
		}

		//Find last item
		var lastItem;
		for (var i = 0; i < parentItem.items.length; i++) {
			if (parentItem.items[i].nextItemID == null) {
				lastItem = parentItem.items[i];
				break;
			}
		}
		//Order them according to nextItemID
		var orderedItems = [ lastItem ];
		var maxDone = 1000;
		//console.log(parentItem.items);
		while (orderedItems.length !== parentItem.items.length) {  //&& maxDone = true
 			for (var i = 0; i < parentItem.items.length; i++) {
				//console.log("This loop:");
				//console.log("nextItemID:" + parentItem.items[i].nextItemID + " ; inloop: " + orderedItems[0]._id.$oid);
				if (parentItem.items[i].nextItemID == orderedItems[0]._id.$oid) {
					orderedItems.splice(0, 0, parentItem.items[i]);
				}
			}
			maxDone--;
		}
		parentItem.items = orderedItems;
		

		for (var i = 0; i < orderedItems.length; i++) {
			orderItems(orderedItems[i]);
		}

	}

	$scope.onLogoutClick = function() {
		$scope.user = {};		
		$scope.menuTitle = _menuTitle;
		$scope.loggedIn = false;
		$scope.projects = [];
	};
	$scope.onCreateProjectClick = function() {
		resetItems();
		ngDialog.open({
			template: "templateProject",
			controller: "popup",
			scope: $scope
		});
	};
	$scope.onCreateItemSiblingClick = function(project, previousItem, nextItem, parentItems) {
		resetItems();
		//previousItem is previous sibling, can be undefined, first item in array in that case
		//nextItem is used if item is being inserted between two items, can be undefined, last item in array in that case
		$scope.selectedProject = project;
		$scope.selectedPreviousItem = previousItem;
		$scope.selectedNextItem = nextItem;
		console.log(previousItem);
		console.log(nextItem);
		ngDialog.open({
			template: "templateItem",
			controller: "popup",
			scope: $scope
		});
	};
	$scope.onCreateItemChildClick = function(project, parentItem) {
		resetItems();
		//Parent item is one level above, can be undefined, root level in that case
		$scope.createChild = true;
		$scope.selectedProject = project;
		$scope.selectedParentItem = parentItem;
		if (parentItem) {
			if (parentItem.items.length > 0) {
			//If parent item already has children, the last child needs to be updated
				$scope.selectedPreviousItem = parentItem.items[ parentItem.items.length-1 ];
			}
		}
		else if ( project.items.length > 0) {
			$scope.selectedPreviousItem = project.items[ project.items.length-1 ];
		}
		ngDialog.open({
			template: "templateItem",
			controller: "popup",
			scope: $scope
		});
	}

	function resetItems() {
		delete $scope["selectedProject"];
		delete $scope["selectedPreviousItem"];
		delete $scope["selectedNextItem"];
		delete $scope["selectedParentItem"];
		delete $scope["createChild"];
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
			if (response._id) {
				$scope.onLoginSuccess(response);
			}
		});
	};

	$scope.submitProject = function(project) {
		$scope.prepareItem(project, "root");
		db.createProject(project, function(response) {
			response.items = [];
			$scope.projects.push(response);
			console.log($scope.projects);
		});
	};
	$scope.submitCreateItem = function(project, item, itemToBeUpdated) {
		$scope.prepareItem(item, project._id.$oid);
		db.createItem(item, function(response) {
			response.items = [];
			addItemToProject(project, response);

			if (itemToBeUpdated) {
				db.updateItemNextItemID(itemToBeUpdated, response._id.$oid, function(updatedItemResponse) {
					itemToBeUpdated.nextItemID = response._id.$oid;	
				});
			}

		});
	};

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

	//add item to project recursively, CAN ONLY BE USED AFTER PROJECT ALREADY LOADED
	function addItemToProject(parentItem, item) {
		if (!parentItem.items) {
				parentItem.items = [];
		}	

		if (parentItem._id.$oid == item.parentItemID || item.parentItemID == "root") {
			//Correct parentItem, now need to insert it at right position
			if (item.nextItemID == null) {
				//Insert it at end of array
				parentItem.items.push(item);
				return;
			}

			for (var i = 0; i < parentItem.items.length; i++) {
				//Insert it at specific position
				if (parentItem.items[i]._id.$oid == item.nextItemID) {
					//Insert it before this item
					parentItem.items.splice(i, 0, item);
					return;
				}
			}
			

		}

		for (var i = 0; i < parentItem.items.length; i++) {
			addItemToProject(parentItem.items[i], item);
		}
	}

}]);