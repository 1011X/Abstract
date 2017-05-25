Vertex.Base = class {
	constructor(graph) {
		this.pos = new Vec2
		this.motion = new Vec2
		
		this.graph = graph
	}
	
	get neighbors() {
		return this.graph.neighborsOf(this)
	}
	
	// maybe???
	update(inp, outp) {
	}
	
	action() {}
	
	toJSON() {
		return {
			pos: this.pos.toArray(),
			motion: this.motion.toArray(),
		}
	}
	
	static fromJSON(json) {
	}
}

Vertex.Base.prototype.radius = 18
Vertex.Base.prototype.type = "none"
