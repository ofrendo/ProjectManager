app.controller("main", ["$scope", "$http", "$timeout", "db", "ngDialog", function($scope, $http, $timeout, db, ngDialog) {
	//Local storage handling     
    $scope.localStorage = localStorage;
    $scope.setShowChildItems = function(item, value) {
    	localStorage.setItem(item._id.$oid + 'showChildItems', value);
    };
	$scope.getShowChildItems = function(item) {
		return localStorage.getItem(item._id.$oid + 'showChildItems');
	};
	$scope.setInitValue = function(item) {
    	var currentValue = $scope.getShowChildItems(item);
    	if (currentValue == null)  //Value has not been set before
    		$scope.setShowChildItems(item, true);
    };
	$scope.toggleShowChildItems = function(item) {
    	var currentValue = $scope.getShowChildItems(item);
    	if (currentValue == "true") 
    		$scope.setShowChildItems(item, false);
    	else
    		$scope.setShowChildItems(item, true);
    };

    //Init values
	var _menuTitle = "Personal project manager";
    $scope.menuTitle = _menuTitle;
    $scope.loggedIn = false;
    $scope.numLoaded = "Loading...";
    $scope.user = {};
    $scope.projects = [];
    $scope.itemStatuses = [ 
    	{ 
    		id: "done",
    		text: "Done",
    		iconPath: "fa-check",
    		tooltip: "Mark 'Done'",
    		textDecoration: "line-through",
    		lsID: "showDoneItems", //localstorage ID
    		show: localStorage.getItem("showDoneItems") === "true" ? true : false
    	},
    	{
    		id: "delayed",
    		text: "Delayed", 
    		iconPath: "fa-clock-o", 
    		tooltip: "Mark 'Delayed'",
    		textDecoration: "underline",
    		lsID: "showDelayedItems", 
    		show: localStorage.getItem("showDelayedItems") === "true" ? true : false
    	},
    	{
    		id: "notDone",
    		text: "Not done",
    		iconPath: "fa-times",
    		tooltip: "Mark 'Not done'",
    		textDecoration: "initial",
    		lsID: "showNotDoneItems", 
    		show: localStorage.getItem("showNotDoneItems") === "true" ? true : false
    	}
    ];
    $scope.itemInitialStatus = $scope.itemStatuses[2].text;
    $scope.$watch("itemStatuses", function(newStatus, oldStatus) {
    	localStorage.setItem(newStatus.lsID, newStatus.show)
    });


    $scope.tooltips = {
    	edit: "Edit",
    	createPrevious: "Create previous sibling",
    	createNext: "Create next sibling",
    	createChild: "Create child",
    	delete: "Delete"
    };
    $scope.getStatusTextStyle = function(statusText) {
    	for (var i = 0; i < $scope.itemStatuses.length; i++) {
    		if ($scope.itemStatuses[i].text == statusText) 
    			return $scope.itemStatuses[i].textDecoration;
    	}
    };	

    $scope.onSetSelectedItem = function(item, $event) { //Called when clicked on project item
    	$scope.selectedItem = item;
    	$event.stopPropagation();
    }
    $scope.sortableOptions = {
    	update: function(e, ui) {
    		var droptarget = ui.item.sortable.droptarget;
    		var originalItems = droptarget.scope().$eval(droptarget.attr('ng-model'));
    		var originalIndex = ui.item.sortable.index;
    		var newIndex = ui.item.sortable.dropindex;

    		//Items that need to be updated:
    		//The originalPreviousItem
    		//The newPreviousItem
    		var originalPreviousItem = originalItems[ originalIndex-1 ];
    		var draggedItem = originalItems[ originalIndex ];
    		var newPreviousItem = (newIndex > originalIndex) ? originalItems[ newIndex ] : originalItems[ newIndex-1 ];
    		var newNextItem = (newIndex > originalIndex) ? originalItems[newIndex+1] : originalItems[newIndex]

    		if (originalPreviousItem) {
    			//Need to find the new nextItemID for this item
    			var localNewNextItem = originalItems[ originalIndex+1 ];
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

    	}
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
					var item = response[i]; //Item to be pushed to array
					if (item.parentItemID !== "root") {
						//Find the item this item is the child of
						for (var j = 0; j < response.length; j++) {
							if (item.parentItemID == response[j]._id.$oid) {

								if (!item.items) 
									item.items = [];
								if (!response[j].items) 
									response[j].items = [];
								response[j].items.push(item);

							}
						}
					}
				}
			}

			//Order items by nextItemID
			for (var i = 0; i < $scope.projects.length; i++) {
				orderItems($scope.projects[i]);
			}

			//set selected item for cursor object
			$scope.showCursor = false;
			var found = false;
			for (var i = 0; i < response.length; i++) {
				if (response[i]._id.$oid == localStorage.getItem("cursorPosition")) {
					found = true;
					setCursorAfterRender(response[i]);
				}
			}

			//If nothing has been found
			if ($scope.projects.length > 0 && found === false) {
				$scope.selectedItem = $scope.projects[0];
				$scope.showCursor = true;
			}
		});
	};

	function setCursorAfterRender(item) {
		(function(selectedItem) {
			$timeout(function() {
				$scope.selectedItem = selectedItem;
				$scope.showCursor = true;
			}, 100);
		})(item);
	}

	function orderItems(parentItem) {
		if (!parentItem) 
			return;
		if (parentItem.items.length === 0) 
			return;
		

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

		localStorage.removeItem("remember");
	};
	$scope.onCreateProjectClick = function() {
		resetItems();
		ngDialog.open({
			template: "templateProject",
			controller: "popup",
			scope: $scope
		});
	};
	$scope.onUpdateProjectClick = function(project) {
		resetItems();
		$scope.updateProject = project;
		$scope.selectedItem = project;
		ngDialog.open({
			template: "templateProject",
			controller: "popup",
			scope: $scope
		});
	};
	$scope.onCreateItemSiblingClick = function(project, previousItem, nextItem, selectedItem) {
		resetItems();
		//previousItem is previous sibling, can be undefined, first item in array in that case
		//nextItem is used if item is being inserted between two items, can be undefined, last item in array in that case
		$scope.selectedProject = project;
		$scope.selectedItem = selectedItem;
		$scope.selectedPreviousItem = previousItem;
		$scope.selectedNextItem = nextItem;
		//console.log(previousItem);
		//console.log(nextItem);
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
		$scope.selectedItem = parentItem || project;
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
	};
	$scope.onUpdateItemClick = function(item) {
		resetItems();
		$scope.selectedItem = item;
		$scope.updateItem = true;
		ngDialog.open({
			template: "templateItem",
			controller: "popup",
			scope: $scope
		});
	};

	$scope.applyKeyListeners = function() {
		$("body").on("keydown.pm", function(event) {
			if ($scope.isDialogOpen !== true) { //What happens on keypress, such as hotkeys for modifying items or navigating with the cursor
				//$scope.$apply(function() {
					switch (event.keyCode) {
					case 38: //Up arrow
					case 40: //Down arrow: Navigate among items, move cursor
						//Need to find parent item of selectedItem
						//That way can get sibling item
						var moveCursorFunction = (event.keyCode === 38) ? moveCursorUp : moveCursorDown;
						var item = $scope.selectedItem;
						if (item.projectID === "root") {
							moveCursorFunction(item, $scope.projects);
						}
						else {
							var parentItemID = (item.parentItemID  === "root") ? item.projectID : item.parentItemID;
							var parentItem = findItem($scope.projects, parentItemID);
							moveCursorFunction(item, parentItem.items);
						}

						event.preventDefault();
						break;
					case 9: //Tab: NOT IMPLEMENTED YET, change tree level


						event.preventDefault();
						break;
					case 32: //Space: Change viewchilditems
						$scope.toggleShowChildItems($scope.selectedItem);
						event.preventDefault(); 
						break;
					case 88: //ctrl+x: Edit
						if (event.ctrlKey === true) {
							if ($scope.selectedItem.projectID === "root") {
								clickButton("#cursor ~ button.projectRootEdit");
							}
							else {
								clickButton("#cursor ~ .buttonContainer>button:nth-child(1");
							}
							event.preventDefault();
						}
						break;
					case 49: //1: Set status to done
						clickButton("#cursor ~ .buttonContainer>button:nth-child(2)");
						event.preventDefault();
						break;
					case 50: //2: set status to delayed
						clickButton("#cursor ~ .buttonContainer>button:nth-child(3)");
						event.preventDefault();
						break;
					case 51: //3: Set status to not done
						clickButton("#cursor ~ .buttonContainer>button:nth-child(4)");
						event.preventDefault();
						break;
					case 13: //Enter: create item
						if ($scope.selectedItem.projectID === "root") {
							clickButton("#cursor ~ button.projectRootButton");
						}
						else if (event.shiftKey === true) {//Create previous sibling
							clickButton("#cursor ~ .buttonContainer>button:nth-child(5)");
						}
						else if (event.ctrlKey === true) { //Create child item
							clickButton("#cursor ~ .buttonContainer>button:nth-child(7)");
						}
						else { //Create next sibling
							clickButton("#cursor ~ .buttonContainer>button:nth-child(6)");
						}
						
						event.preventDefault();							
						break;
					case 68: //Ctrl+d: delete
						if (event.ctrlKey === true) {
							if ($scope.selectedItem.projectID === "root") {
								clickButton("#cursor ~ button.projectRootDelete");
							}
							else {
								clickButton("#cursor ~ .buttonContainer>button:nth-child(8)");
							}
							event.preventDefault();
						}
					} 
					//console.log(event);
				//});
			}
		});
		$("body").on("keyup.pm", function(event) {
			if ($scope.isDialogOpen !== true) { //What happens on keypress, such as hotkeys for modifying items or navigating with the cursor
				$scope.$apply(function() {
					
				});
				event.preventDefault();
			}
		});
	}
	$scope.removeKeyListeners = function() {
		$("body").unbind("keydown.pm").unbind("keyup.pm");
	}
	
	function clickButton(selector) {
		$timeout(function() {
			angular.element(selector).trigger("click");
		}, 0);
	}
	
	//Save cursor position when it moves 
	$scope.$watch("selectedItem", function(newValue, oldValue) {
		if (newValue)
			localStorage.setItem("cursorPosition", newValue._id.$oid);
	});
	
	function resetItems() {
		delete $scope["selectedProject"];
		delete $scope["selectedPreviousItem"];
		//delete $scope["selectedItem"];
		delete $scope["selectedNextItem"];
		delete $scope["selectedParentItem"];
		delete $scope["createChild"];
		delete $scope["updateItem"];
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
			if ($scope.projects.length === 1) {
				$scope.selectedItem = response;
			}
		});
	};
	$scope.submiteUpdateProject = function(project) {
		db.updateProject(project, function(response) {
			var originalProject = findItem($scope.projects, project._id.$oid);
			originalProject.name = response.name;
		});
	};
	$scope.submitDeleteProject = function(project) {
		db.deleteProject(project, function(response) {
			var projectIndex = $scope.projects.indexOf(project);
			$scope.projects.splice(projectIndex, 1);
		});
	};

	$scope.submitCreateItem = function(project, item, itemToBeUpdated) {
		$scope.prepareItem(item, project._id.$oid);
		db.createItem(item, function(response) {
			response.items = [];
			addItemToProject(project, response);
			setCursorAfterRender(response);
			if (itemToBeUpdated) {
				db.updateItemNextItemID(itemToBeUpdated, response._id.$oid, function(updatedItemResponse) {
					itemToBeUpdated.nextItemID = response._id.$oid;	
				});
			}

		});
	};
	$scope.submitUpdateItem = function(item, newDescription, newPriority) {
		db.updateItemDetails(item, newDescription, newPriority, item.status, function(response) {
			item.description = newDescription;
			item.priority = newPriority;
		});
	};
	$scope.submitUpdateItemStatus = function(item, newStatus) {
		$scope.selectedItem = item;
		db.updateItemDetails(item, item.description, item.priority, newStatus, function(response) {
			item.status = newStatus;
		});
	};
	$scope.submitDeleteItem = function(item, siblingItems, $event) {
		moveCursorUp(item, siblingItems);
		deleteChildItems(item, siblingItems);

		//Update previous item's itemNextID
		var itemIndex = siblingItems.indexOf(item);
		if (itemIndex !== 0) {
			var previousItem = siblingItems[itemIndex-1];
			var nextItem = siblingItems[itemIndex+1];
			var nextItemID = (nextItem) ? nextItem._id.$oid : null;
			db.updateItemNextItemID(previousItem, nextItemID, function() {});
		}

		$event.stopPropagation();
	};

	function moveCursorDown(item, siblingItems) {
		var itemIndex = siblingItems.indexOf(item);
		if (item.items.length > 0 && localStorage.getItem(item._id.$oid + "showChildItems") != "false") { 
			//If this item has any children: Set first child as selected item
			$scope.selectedItem = item.items[0];
		}
		else if (itemIndex < siblingItems.length-1) { //If this item has a next item, meaning is not the last item
			$scope.selectedItem = siblingItems[itemIndex+1];
		}
		else {
			navigateCursorDown(item);
		}
	}

	function navigateCursorDown(item) {
		var parentItemID = (item.parentItemID  === "root") ? item.projectID : item.parentItemID;
		var parentItem = findItem($scope.projects, parentItemID);
		if (!parentItem) { //Special case when trying to navigate down from project button without children
			return;
		}

		if (parentItem.nextItemID !== null && parentItem.projectID !== "root") {
			$scope.selectedItem = findItem($scope.projects, parentItem.nextItemID);
		}
		else {
			if (parentItem.projectID === "root") {
				var currentProjectIndex = $scope.projects.indexOf(parentItem);
				if (currentProjectIndex !== $scope.projects.length-1) { //If not the last item in the last project
					$scope.selectedItem = $scope.projects[ currentProjectIndex+1 ];
				}
			}
			else { //Need to search for next parentitem, as long as item is not a project
				navigateCursorDown(parentItem);
			}
		}

	}

	function moveCursorUp(item, siblingItems) {
		//Move cursor to previous item - not in previous sibling but visually above item
		var itemIndex = siblingItems.indexOf(item);
		if (item.projectID === "root") { //Project button
			var projectIndex = $scope.projects.indexOf(item);
			if (projectIndex > 0) { //If not the first project, move cursor to project above
				var previousProject = $scope.projects[ projectIndex-1 ];
				if (previousProject.items.length > 0) { //Check if project has any items
					navigateCursorUp( previousProject.items[ previousProject.items.length-1 ]);
				}
				else {
					$scope.selectedItem = previousProject;
				}
			}
		}
		else if (itemIndex === 0 && item.parentItemID === "root") { //Very first item in a project
			setItemByID($scope.projects, item.projectID); //setItemByID(project, project._id.$oid);
		}
		else if (itemIndex === 0) { //First check if this is the first item in the array, in which case new selected item is the parent
			setItemByID($scope.projects, item.parentItemID);
		}
		else { //Else find the item above this one
			//var previousItems = parentItem.items.slice(0, itemIndex);
			navigateCursorUp( siblingItems[itemIndex-1] );
		}
	}

	function navigateCursorUp(item) { //navigates the cursor to a visually previous item
		if (item.items.length === 0 || localStorage.getItem(item._id.$oid + "showChildItems") == "false") {
			$scope.selectedItem = item;
		}

		if (localStorage.getItem(item._id.$oid + "showChildItems") == "false") 
			return;

		item.items.loopInDirection("up", function(index, childItem) {
			navigateCursorUp(childItem);
		});
	}

	Array.prototype.loopInDirection = function(direction, callback) {
		if (direction == "up") {
			for (var i = this.length-1; i >= 0; i--) {
				callback(i, this[i]);
			}
		}
		else {
			for (var i = 0; i < this.length; i++) {
				callback(i, this[i]);
			}
		}
	}

	//Sets the selectedItem by ID
	function setItemByID(parentItems, itemID) {
		$scope.selectedItem = findItem(parentItems, itemID);
	}

	//Searches through the items array recursively for a given itemID
	function findItem(items, itemID) { 
		var result;
		for (var i = 0; !result && i < items.length; i++) {
			if (items[i]._id.$oid == itemID) {
				return items[i];
			}
			
			result = findItem(items[i].items, itemID);
		}
		return result;
	}

	//Delete an item and its children recursively
	function deleteChildItems(item, parentItems) {
		for (var i = 0; i < item.items.length; i++) {
			deleteChildItems(item.items[i], item.items);
		}
		db.deleteItem(item, function(response) {
			var index = parentItems.indexOf(item);
			parentItems.splice(index, 1);
			localStorage.removeItem(item._id.$oid + "showChildItems");
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
		item.status = $scope.itemInitialStatus;
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
	$scope.applyKeyListeners();


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