class VertexOne extends Vertex {
	constructor(graph) {
		this.style.symbol = "1"
	}

	update(options) {
		for(let neighbor of this.neighbors)
			options.send(neighbor, 1)
		
		this.inputs = []
	}
}
