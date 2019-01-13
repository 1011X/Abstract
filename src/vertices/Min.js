Vertex.Min = class extends Vertex.Base {
	update(h) {
		return Math.min(...h.inputs)
	}
}

Vertex.Min.prototype.style = new VertexStyle("white", {symbol: "∧"})
