Vertex.Base = class {
	constructor() {
		this.pos = new Vec2
		this.motion = new Vec2
	}
	
	// should updates return a boolean to indicate whether
	// they should be updated next time? it would be very
	// useful...
	update(ins, outs) {
	}
	
	action() {
	}
	
	toJSON() {
		return Object.assign({}, this)
	}
	
	static fromJSON(json) {
		let vertex = new this
		vertex.pos = new Vec2(...json.pos)
		vertex.motion = new Vec2(...json.motion)
		return vertex
	}
}

Vertex.Base.prototype.radius = 18
Vertex.Base.prototype.style = new VertexStyle("black")
