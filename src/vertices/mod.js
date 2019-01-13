Vertex = Object.create(null)
Vertex.registry = new RegistryWithDefault("none")

Vertex.Base = class {
	constructor() {
		this.pos = new Vec2(0, 0)
		this.motion = new Vec2(0, 0)
		//this.angle = 0
	}
	
	update(handler) {
	    return 0
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

Vertex.Base.prototype.radius = 24
Vertex.Base.prototype.style = new VertexStyle("black")
