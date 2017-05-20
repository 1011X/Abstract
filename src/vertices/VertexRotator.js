class VertexRotator extends Vertex {
	update(options) {
		for(let neighbor of this.neighbors) {
			if(neighbor === options.selected) {
				continue
			}
		
			let energy = this.inputs.reduce((acc, val) => acc + val, 0)
			let displace = Vec2.subtract(neighbor.pos, this.pos)
			Vec2.rotate(displace, Math.TAU / 60 * energy, displace)
		
			Vec2.add(this.pos, displace, neighbor.pos)
		}
		
		this.inputs = []
	}
}

VertexRotator.prototype.style = new VertexStyle("lightgreen")
