Vertex.Negate = class extends Vertex.Base {
	update(ins, outs) {
		let max = Math.max(...ins)
		outs.fill(-max)
 	}
}

Vertex.Negate.prototype.style = new VertexStyle("white", {symbol: "–"})
