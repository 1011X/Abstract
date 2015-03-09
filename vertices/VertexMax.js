"use strict"

function VertexMax(graph){
	Vertex.call(this, graph)
}

VertexMax.prototype = Object.create(Vertex.prototype)
VertexMax.prototype.constructor = VertexMax

VertexMax.prototype.symbol = "max"
VertexMax.prototype.type = "max"

VertexMax.prototype.update = function(options){
	var furthest = MathHelper.maxabs(this.inputs)
	for(var neighbor of this.neighbors)
		options.send(neighbor, furthest)
	this.inputs = []
}