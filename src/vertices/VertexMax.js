class VertexMax extends Vertex {
	update(options) {
		let max = Math.max(...this.inputs)
		
		for(let neighbor of this.neighbors) {
			options.send(neighbor, max)
		}
		
		this.inputs = []
	}
}

VertexMax.prototype.style = new VertexStyle("white", {symbol: "∨"})
