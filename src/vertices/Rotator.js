Vertex.Rotator = class extends Vertex.Base {
	update(ins, outs) {
		/*
		for(let neighbor of this.neighbors) {
			// TODO figure out why rotating gives neighbor a position of NaN,NaN
			let energy = ins.reduce((acc, val) => acc + val, 0)
			let displace = neighbor.pos.clone()
				.sub(this.pos)
				.rotate(Math.TAU / 60 * energy)
		
			neighbor.pos.cloneFrom(this.pos)
			neighbor.pos.add(displace)
		}
		*/
	}
}

Vertex.Rotator.prototype.style = new VertexStyle("lightgreen", {
	symbol: "⛭",
	gradient: VertexStyle.RADIAL_GRADIENT
})
