class VertexMin extends Vertex {
	update(options) {
		let closest = Math.min(...this.inputs)
		
		for(let neighbor of this.neighbors) {
			options.send(neighbor, closest)
		}
		
		this.inputs = []
	}
}

VertexMin.prototype.style = new VertexStyle("white", {symbol: "∧"})
