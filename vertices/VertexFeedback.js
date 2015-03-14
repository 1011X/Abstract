function VertexFeedback(graph){
	Vertex.call(this, graph)
	// not really necessary, but for completeness's sake
	this.style = new Style({
		color: "gray",
		symbol: "0",
	})
}

VertexFeedback.prototype = Object.create(Vertex.prototype)
VertexFeedback.prototype.constructor = VertexFeedback

VertexFeedback.prototype.type = "feedback"
// for when drawing vertex in gui
VertexFeedback.prototype.style = new Style({
	color: "gray",
	symbol: "0",
})

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
		this.style.color = "white"
		this.style.textColor = "black"
	}
	else if(value === -Infinity){
		this.style.color = "black"
		this.style.textColor = "white"
	}
	else {
		this.style.color = "gray"
		this.style.textColor = "black"
	}
}

VertexFeedback.prototype.update = function(options){
	var energy = MathHelper.sum(this.inputs)
	this.setColor(energy)
	this.style.symbol = this.format(energy)
	this.inputs = []
}