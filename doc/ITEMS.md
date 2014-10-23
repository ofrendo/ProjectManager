Features
	Cursor
		Key bindings
			Edit: e
			Done: 1, Delayed: 2, Not done: 3
			Create previous sibling: shift enter
			Create next sibling: enter
			Create child: ctrl enter
			Delete: ctrl d AND delete
			Bind events to divContent so that when popup comes events are not fired anymore
		Keep reference to selectedItem and position cursor next to that
	Description field textarea
		Enter ==> Submit
		Shift enter ==> new line
	Add buttons for changing tree level
	Have a look at other websites for inspiration when done with your features
	Make stuff real time
		Change it back if error
Issues
	Group buttonsContainer correctly
	Autofocus only on very first popup
	Implement delete properly to delete child items