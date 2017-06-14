Vertex.Neuron = class extends Vertex.Base {
	constructor() {
		super()
		this.threshold = 1
	}
	
	// TODO impl burnout
	update(ins, outs) {
		let energy = ins.reduce((acc, val) => acc + val, 0)
		
		if(energy >= this.threshold) {
			for(let i = 0; i < outs.length; i++) {
				outs[i] = 1
			}
		}
	}
}

Vertex.Neuron.prototype.style = new VertexStyle("darkgray")
