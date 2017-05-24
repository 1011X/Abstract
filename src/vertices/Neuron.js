Vertex.Neuron = class extends Vertex.Base {
	constructor(graph) {
		super(graph)
		this.threshold = 1
	}

	update(options) {
		let energy = this.inputs.reduce((acc, val) => acc + val, 0)
		
		if(energy >= this.threshold) {
			for(let neighbor of this.neighbors) {
				options.send(neighbor, 1)
			}
		}
		
		this.inputs = []
	}
	
	toJSON() {
		let data = super.toJSON()
		data.threshold = this.threshold
		return data
	}
}

Vertex.Neuron.prototype.style = new VertexStyle("darkgray")
