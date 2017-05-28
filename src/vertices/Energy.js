Vertex.Energy = class extends Vertex.Base {
	constructor() {
		super()
		this.energy = 1
	}
	
	update(ins, outs) {
		outs = outs.map(_ => 1)
	}
}

Vertex.Energy.prototype.style = new VertexStyle("yellow")
