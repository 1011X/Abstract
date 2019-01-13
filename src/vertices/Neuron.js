Vertex.Neuron = class extends Vertex.Base {
	constructor() {
		super()
		this.threshold = 3
	}
	
	// TODO impl burnout
	update(h) {
		let energy = h.inputs.reduce((acc, val) => acc + val, 0)
		return energy >= this.threshold ? 1 : 0
	}
}

Vertex.Neuron.prototype.style = new VertexStyle("darkgray", {symbol: "N"})
