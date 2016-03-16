class VertexAdd extends Vertex {
	constructor(graph) {
		this.style.symbol = "+"
	}
	
	update(options) {
		let sum = MathHelper.sum(this.inputs)
		
		for(var neighbor of this.neighbors)
			options.send(neighbor, sum)
		
		this.inputs = []
	}
}
