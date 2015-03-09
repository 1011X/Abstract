"use strict"

function VertexInverse(graph){
	Vertex.call(this, graph)
}

VertexInverse.prototype = Object.create(Vertex.prototype)
VertexInverse.prototype.constructor = VertexInverse

VertexInverse.prototype.symbol = "-"
VertexInverse.prototype.type = "inverse"

VertexInverse.prototype.update = function(options){
	var value = MathHelper.maxabs(this.inputs)
	for(var neighbor of this.neighbors)
		options.send(neighbor, value === Infinity ? Infinity : -value)
	this.inputs = []
}