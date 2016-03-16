class Mouse {
	constructor() {
		this.buttons = 0
		this.wheel = Vec2.create32()
		this.motion = Vec2.create32()
		this.wheelXDelta = 0
		this.wheelYDelta = 0
		this.posXDelta = 0
		this.posYDelta = 0
	
		this._ppx = 0
		this._ppy = 0
	}
	
	get left() {
		return (this.buttons & 1) != 0
	}
	
	get right() {
		return (this.buttons & 2) != 0
	}
	
	get middle() {
		return (this.buttons & 4) != 0
	}
	
	handler(e) {
		if(e.type == "mousedown"){
			if(e.buttons)
				this.buttons = e.buttons
			else {
				if( e.button == 0 )
					this.buttons |= 1
				else if( e.button == 1 )
					this.buttons |= 4
				else if( e.button == 2 )
					this.buttons |= 2
			}
		}
		else if(e.type == "mouseup"){
			if(e.buttons)
				this.buttons = e.buttons
			else {
				if( e.button == 0 )
					this.buttons |= 1
				else if( e.button == 1 )
					this.buttons |= 4
				else if( e.button == 2 )
					this.buttons |= 2
			}
		}
	}
}
