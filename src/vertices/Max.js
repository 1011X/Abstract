Vertex.Max = class extends Vertex.Base {
	update(options) {
		let max = Math.max(...this.inputs)
		
		for(let neighbor of this.neighbors) {
			options.send(neighbor, max)
		}
		
		this.inputs = []
	}
}

Vertex.Max.prototype.style = new VertexStyle("white", {symbol: "∨"})
