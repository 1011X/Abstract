function VertexFeedback(graph){
	Vertex.call(this, graph)
	// not really necessary, but for completeness's sake
	this.color = "gray"
	this.textColor = "black"
}

VertexFeedback.prototype = Object.create(Vertex.prototype)
VertexFeedback.prototype.constructor = VertexFeedback

// for when drawing vertex in gui
VertexFeedback.prototype.color = "gray"
VertexFeedback.prototype.textColor = "black"

VertexFeedback.prototype.symbol = "0"
VertexFeedback.prototype.type = "feedback"

VertexFeedback.prototype.format = function(value){
	if(value === Infinity)
		return "∞"
	else if(value === -Infinity)
		return "-∞"
	else
		return value.toString()
}

VertexFeedback.prototype.setColor = function(value){
	if(value === Infinity){
		this.color = "white"
		this.textColor = "black"
	}
	else if(value === -Infinity){
		this.color = "black"
		this.textColor = "white"
	}
	else {
		this.color = "gray"
		this.textColor = "black"
	}
}

VertexFeedback.prototype.update = function(options){
	var energy = MathHelper.sum(this.inputs)
	this.setColor(energy)
	this.symbol = this.format(energy)
	this.inputs = []
}