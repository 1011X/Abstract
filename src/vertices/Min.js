Vertex.Min = class extends Vertex.Base {
	update(options) {
		let closest = Math.min(...this.inputs)
		
		for(let neighbor of this.neighbors) {
			options.send(neighbor, closest)
		}
		
		this.inputs = []
	}
}

Vertex.Min.prototype.style = new VertexStyle("white", {symbol: "∧"})
