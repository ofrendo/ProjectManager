Features
	Cursor
		Key bindings
			Edit: e
			Done: 1, Delayed: 2, Not done: 3
			Create previous sibling: shift enter
			Create next sibling: enter
			Create child: tab
			Delete: ctrl d AND delete
			Bind events to divContent so that when popup comes events are not fired anymore
	Description field textarea
		Enter ==> Submit
		Shift enter ==> new line
	Either add buttons for changing tree level or implement dragging to another level
	On popup open
	Allow collapsing of every item which has child items
		Show collapsing/show button on bullet-point
	Have a look at other websites for inspiration when done with your features
	Make stuff real time
		Change it back if error
Issues
	Group buttonsContainer correctly
	Autofocus only on very first popup
	To reproduce bug: Create item -> create child l1 -> create child l2 -> create next sibling l1 
	Implement delete properly to delete child items