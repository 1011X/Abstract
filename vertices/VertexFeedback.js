function VertexFeedback(graph){
	Vertex.call(this, graph)
	this.color = "#000"
}

VertexFeedback.prototype = Object.create(Vertex.prototype)
VertexFeedback.prototype.constructor = VertexFeedback

VertexFeedback.prototype.color = "black"
VertexFeedback.prototype.type = "feedback"

VertexFeedback.prototype.setColor = function(value){
	var hexNum = Math.floor(value * 15).toString(16)
	this.color = "#" + hexNum + hexNum + hexNum
}

VertexFeedback.prototype.update = function(options){
	var energy = Math.max(0, Math.min(this.energy, 1))
	this.setColor(energy)
	this.energy = 0
}