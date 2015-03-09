function VertexFeedback(graph){
	Vertex.call(this, graph)
}

VertexFeedback.prototype = Object.create(Vertex.prototype)
VertexFeedback.prototype.constructor = VertexFeedback

VertexFeedback.prototype.type = "feedback"

VertexFeedback.prototype.format = function(value){
	if(value === Infinity)
		return "∞"
	else
		return value.toPrecision(2)
}

VertexFeedback.prototype.update = function(options){
	var energy = MathHelper.sum(this.inputs)
	// this.setColor(energy)
	this.symbol = this.format(energy)
	this.inputs = []
}