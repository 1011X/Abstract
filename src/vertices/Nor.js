Vertex.Nor = class extends Vertex.Base {
	constructor(graph) {
		super(graph)
		this.energy = 0
	}

	update(options) {
		for(let neighbor of this.neighbors) {
			if(!this.energy) {
				options.send(neighbor, 1)
			}
		}
		
		this.energy = 0
	}
	
	toJSON() {
		let data = super.toJSON()
		data.energy = this.energy
		return data
	}
}

Vertex.Nor.prototype.style = new VertexStyle("skyblue", {symbol: "N"})
