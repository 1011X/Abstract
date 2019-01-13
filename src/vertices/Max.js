Vertex.Max = class extends Vertex.Base {
	update(h) {
		return Math.max(...h.inputs)
	}
}

Vertex.Max.prototype.style = new VertexStyle("white", {symbol: "∨"})
