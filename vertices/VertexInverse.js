"use strict"

function VertexInverse(graph){
	Vertex.call(this, graph)
}

VertexInverse.prototype = Object.create(Vertex.prototype)
VertexInverse.prototype.constructor = VertexInverse

VertexInverse.prototype.type = "inverse"

VertexInverse.prototype.style = new Style({
	color: "skyblue",
	symbol: "neg",
})

VertexInverse.prototype.update = function(options){
	var max = Math.max.apply(null, this.inputs)
	for(var neighbor of this.neighbors)
		options.send(neighbor, -max)
	this.inputs = []
}