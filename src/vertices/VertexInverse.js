class VertexInverse extends Vertex {
	update(options) {
		let max = Math.max(...this.inputs)
		
		for(let neighbor of this.neighbors) {
			options.send(neighbor, -max)
		}
		
		this.inputs = []
	}
}

VertexInverse.prototype.style = new VertexStyle("skyblue", {symbol: "–"})
