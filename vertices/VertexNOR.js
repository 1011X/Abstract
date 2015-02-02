function VertexNOR(graph){
	Vertex.call(this, graph)
}

VertexNOR.prototype = Object.create(Vertex.prototype)
VertexNOR.prototype.constructor = VertexNOR

VertexNOR.prototype.color = "skyblue"
VertexNOR.prototype.symbol = "N"
VertexNOR.prototype.type = "nor"

VertexNOR.prototype.update = function(options){
	for(var neighbor of this.neighbors)
		if(!this.energy)
			options.send(neighbor, 1)
	this.energy = 0
}