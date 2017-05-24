Vertex.Inverse = class extends Vertex.Base {
	update(options) {
		let max = Math.max(...this.inputs)
		
		for(let neighbor of this.neighbors) {
			options.send(neighbor, -max)
		}
		
		this.inputs = []
	}
}

Vertex.Inverse.prototype.style = new VertexStyle("skyblue", {symbol: "–"})
