Vertex.Min = class extends Vertex.Base {
	update(ins, outs) {
		let min = Math.min(...ins)
		
		for(let i = 0; i < outs.length; i++) {
			outs[i] = min
		}
	}
}

Vertex.Min.prototype.style = new VertexStyle("white", {symbol: "∧"})
