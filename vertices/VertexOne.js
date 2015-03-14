"use strict"

function VertexOne(graph){
	Vertex.call(this, graph)
}

VertexOne.prototype = Object.create(Vertex.prototype)
VertexOne.prototype.constructor = VertexOne

VertexOne.prototype.symbol = "1"

VertexOne.prototype.update = function(options){
	for(var neighbor of this.neighbors)
		options.send(neighbor, 1)
	this.inputs = []
}