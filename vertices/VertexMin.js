"use strict"

function VertexMin(graph){
	Vertex.call(this, graph)
}

VertexMin.prototype = Object.create(Vertex.prototype)
VertexMin.prototype.constructor = VertexMin

VertexMin.prototype.symbol = "min"
VertexMin.prototype.type = "min"

VertexMin.prototype.update = function(options){
	var closest = Math.min.apply(null, this.inputs)
	for(var neighbor of this.neighbors)
		options.send(neighbor, closest)
	this.inputs = []
}