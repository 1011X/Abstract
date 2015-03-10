function VertexNOR(graph){
	Vertex.call(this, graph)
}

VertexNOR.prototype = Object.create(Vertex.prototype)
VertexNOR.prototype.constructor = VertexNOR

VertexNOR.prototype.color = "skyblue"
VertexNOR.prototype.symbol = "N"
VertexNOR.prototype.type = "nor"

VertexNOR.prototype.update = function(options){
	var max = Math.max.apply(null, this.inputs)
	for(var neighbor of this.neighbors)
		options.send(neighbor, -max)
	this.inputs = []
}