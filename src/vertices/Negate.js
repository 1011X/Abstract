Vertex.Negate = class extends Vertex.Base {
	update(h) {
		return -Math.max(...h.inputs)
 	}
}

Vertex.Negate.prototype.style = new VertexStyle("white", {symbol: "–"})
