Vertex.Inverse = class extends Vertex.Base {
	update(ins, outs) {
		let max = Math.max(...ins)
		for(let i = 0; i < outs.length; i++) {
			outs[i] = -max
		}
	}
}

Vertex.Inverse.prototype.style = new VertexStyle("skyblue", {symbol: "–"})
