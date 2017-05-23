class Vertex {
	constructor(graph) {
		this.pos = new Vec2
		this.motion = new Vec2
		this.inputs = []
		
		this.graph = graph
		/*
		this.style = {
			symbol: "",
			color: "white",
			textColor: "black",
			border: "black",
			// borderStart: 0,
			// borderEnd: Math.TAU,
		}
		*/
	}
	
	get neighbors() {
		return this.graph.neighborsOf(this)
	}
	
	update() {}
	
	action() {}
	
	toJSON() {
		return {
			type: this.type,
			pos: this.pos.toArray(),
			motion: this.motion.toArray(),
			inputs: this.inputs,
		}
	}
}

Object.defineProperty(Vertex.prototype, "radius", {value: 18})
Object.defineProperty(Vertex.prototype, "type", {value: "none"})
