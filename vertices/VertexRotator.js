"use strict"

function VertexRotator(graph){
	Vertex.call(this, graph)
}

VertexRotator.prototype = Object.create(Vertex.prototype)
VertexRotator.prototype.constructor = VertexRotator

VertexRotator.prototype.type = "rotator"

VertexRotator.prototype.style = new Style({
	color: "lightgreen",
})

VertexRotator.prototype.update = function(options){
	for(var neighbor of this.neighbors){
		if(neighbor === options.selected)
			continue
		
		var energy = MathHelper.sum(this.inputs)
		// update() is called approx. 60 times per second, so
		// 2*pi / 60 = pi / 30
		var displace = Vec2.subtract(neighbor.pos, this.pos)
		Vec2.rotate(displace, Math.PI/30 * energy, displace)
		
		Vec2.add(this.pos, displace, neighbor.pos)
	}
	this.inputs = []
}