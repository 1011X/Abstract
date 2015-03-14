"use strict"

function VertexSwitch(graph){
	Vertex.call(this, graph)
	this.on = false
}

VertexSwitch.prototype = Object.create(Vertex.prototype)
VertexSwitch.prototype.constructor = VertexSwitch

VertexSwitch.prototype.type = "switch"

VertexSwitch.prototype.style = new Style({
	color: "black",
	textColor: "white",
	symbol: "S",
})

VertexSwitch.prototype.toggle = function(){
	this.on = !this.on
	if(this.on){
		this.color = "white"
		this.textColor = "black"
	}
	else {
		this.color = "black"
		this.textColor = "white"
	}
}

VertexSwitch.prototype.action = function(){
	this.toggle()
}

VertexSwitch.prototype.update = function(options){
	for(var neighbor of this.neighbors)
		options.send(neighbor, Infinity * (this.on ? 1 : -1))
}