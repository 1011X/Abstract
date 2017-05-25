Vertex.Neuron = class extends Vertex.Base {
	constructor(graph) {
		super(graph)
		this.threshold = 1
	}

	update(ins, outs) {
		let energy = ins.reduce((acc, val) => acc + val, 0)
		
		if(energy >= this.threshold) {
			for(let i = 0; i < outs.length; i++) {
				outs[i] = 1
			}
		}
	}
	
	toJSON() {
		let data = super.toJSON()
		data.threshold = this.threshold
		return data
	}
}

Vertex.Neuron.prototype.style = new VertexStyle("gray")
