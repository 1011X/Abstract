class VertexMin extends Vertex {
	constructor(graph) {
		super()
		this.type = "min"
		
		this.style.symbol = "min"
	}

	update(options) {
		let closest = Math.min(...this.inputs)
		
		for(let neighbor of this.neighbors)
			options.send(neighbor, closest)
		
		this.inputs = []
	}
}
