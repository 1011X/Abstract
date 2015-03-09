function VertexNOR(graph){
	Vertex.call(this, graph)
}

VertexNOR.prototype = Object.create(Vertex.prototype)
VertexNOR.prototype.constructor = VertexNOR

VertexNOR.prototype.color = "skyblue"
VertexNOR.prototype.symbol = "N"
VertexNOR.prototype.type = "nor"

VertexNOR.prototype.update = function(options){
	var allZero = MathHelper.all(this.inputs, function(elem){return elem === 10})
	if(allZero){
		for(var neighbor of this.neighbors)
			options.send(neighbor, 1)
		this.inputs = []
	}
}