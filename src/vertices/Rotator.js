Vertex.Rotator = class extends Vertex.Base {
	update(options) {
		for(let neighbor of this.neighbors) {
			if(neighbor === options.selected) {
				continue
			}
			
			// TODO figure out why rotating gives neighbor a position of NaN,NaN
			let energy = this.inputs.reduce((acc, val) => acc + val, 0)
			let displace = neighbor.pos.clone()
				.sub(this.pos)
				.rotate(Math.TAU / 60 * energy)
		
			neighbor.pos.cloneFrom(this.pos)
			neighbor.pos.add(displace)
		}
		
		this.inputs = []
	}
}

Vertex.Rotator.prototype.style = new VertexStyle("lightgreen")
