Vertex.Energy = class extends Vertex.Base {
	constructor(graph) {
		super(graph)
		this.energy = 1
	}
	
	update(inputs, options) {
		for(let neighbor of this.neighbors) {
			options.send(neighbor, 1)
		}
		return inputs.map(_ => 1)
	}
	
	toJSON() {
		let data = super.toJSON()
		data.energy = this.energy
		return data
	}
}

Vertex.Energy.prototype.style = new VertexStyle("yellow")
