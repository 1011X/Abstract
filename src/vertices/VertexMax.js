class VertexMax extends Vertex {
	constructor(graph) {
		this.type = "max"
		this.style.symbol = "max"
	}

	update(options) {
		let furthest = Math.max(...this.inputs)
		
		for(let neighbor of this.neighbors)
			options.send(neighbor, furthest)
		
		this.inputs = []
	}
}
