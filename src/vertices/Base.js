Vertex.Base = class {
	constructor(graph) {
		this.pos = new Vec2
		this.motion = new Vec2
		this.inputs = []
		
		this.graph = graph
	}
	
	get neighbors() {
		return this.graph.neighborsOf(this)
	}
	
	// maybe???
	update(inputs) {
		return [] //outputs
	}
	
	action() {}
	
	toJSON() {
		return {
			type: this.type,
			pos: this.pos.toArray(),
			motion: this.motion.toArray(),
			data: null,
		}
	}
}

Vertex.Base.prototype.radius = 18
Vertex.Base.prototype.type = "none"
