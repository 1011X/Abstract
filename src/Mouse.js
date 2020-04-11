class Mouse {
	constructor() {
		this.cursor = new Vec2(0, 0)
		
		// start position of mouse drag
		this.drag = null
		// button that started the drag
		this._drag_button = -1
	}
	
	// return `true` if player is moving the cursor after clicking down but has
	// not raised the button.
	get is_dragging() {
		return this.drag !== null && !this.drag.eq(this.cursor)
	}
	
	reset() {
		this.drag = null
		this._drag_button = -1
	}
	/*
	update(evt) {
		this.cursor.x = evt.clientX
		this.cursor.y = evt.clientY
		
		// TODO?
		if(evt.type == "mousedown") {
			this.drag = this.cursor.clone()
			this._drag_button = evt.button
		} else if(evt.type == "mouseup" && evt.button == this._drag_button) {
			this.drag = null
			this._drag_button = -1
		}
	}
	*/
}
