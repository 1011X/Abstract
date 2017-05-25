Vertex.Energy = class extends Vertex.Base {
	constructor(graph) {
		super(graph)
		this.energy = 1
	}
	
	update(ins, outs) {
		outs = outs.map(_ => 1)
	}
	
	toJSON() {
		let data = super.toJSON()
		data.energy = this.energy
		return data
	}
}

Vertex.Energy.prototype.style = new VertexStyle("yellow")
