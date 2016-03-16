class VertexInverse extends Vertex {
	constructor(graph) {
		this.type = "inverse"
		
		this.style.color = "skyblue"
		this.style.symbol = "neg"
	}

	update(options) {
		let max = Math.max.apply(null, this.inputs)
		
		for(let neighbor of this.neighbors)
			options.send(neighbor, -max)
		
		this.inputs = []
	}
}
