"use strict"

function VertexAdd(graph){
	Vertex.call(this, graph)
}

VertexAdd.prototype = Object.create(Vertex.prototype)
VertexAdd.prototype.constructor = VertexAdd

VertexAdd.prototype.symbol = "+"

VertexAdd.prototype.update = function(options){
	var sum = MathHelper.sum(this.inputs)
	for(var neighbor of this.neighbors)
		options.send(neighbor, sum)
	this.inputs = []
}