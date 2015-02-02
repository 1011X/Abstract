"use strict"

function VertexEnergy(graph){
	Vertex.call(this, graph)
	this.energy = 1
}

VertexEnergy.prototype = Object.create(Vertex.prototype)
VertexEnergy.prototype.constructor = VertexEnergy

VertexEnergy.prototype.color = "yellow"
VertexEnergy.prototype.type = "source"

VertexEnergy.prototype.update = function(options){
	for(var neighbor of this.neighbors)
		options.send(neighbor, 1)
}