class VertexNeuron extends Vertex {
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
}

VertexNeuron.prototype.style = new VertexStyle("darkgray")
