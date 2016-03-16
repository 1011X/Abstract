class VertexNeuron extends Vertex {
	constructor(graph) {
		this.type = "neuron"
		this.threshold = 1
		
		this.style.color = "darkgray"
	}

	update(options) {
		let energy = MathHelper.sum(this.inputs)
		
		if(energy >= this.threshold)
			for(var neighbor of this.neighbors)
				options.send(neighbor, 1)
		
		this.inputs = []
	}
}
