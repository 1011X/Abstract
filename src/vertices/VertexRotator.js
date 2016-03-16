class VertexRotator extends Vertex {
	constructor(graph) {
		this.type = "rotator"
		
		this.style.color = "lightgreen"
	}

	update(options) {
		for(let neighbor of this.neighbors){
			if(neighbor === options.selected)
				continue
		
			let energy = MathHelper.sum(this.inputs)
			// update() is called approx. 60 times per second, so
			// 2*pi / 60 = pi / 30
			let displace = Vec2.subtract(neighbor.pos, this.pos)
			Vec2.rotate(displace, Math.PI/30 * energy, displace)
		
			Vec2.add(this.pos, displace, neighbor.pos)
		}
		this.inputs = []
	}
}
