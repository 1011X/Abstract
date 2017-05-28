Vertex.Base = class {
	constructor() {
		this.pos = new Vec2
		this.motion = new Vec2
	}
	
	update(ins, outs) {
	}
	
	action() {
	}
	
	toJSON() {
		return this
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
