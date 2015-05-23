"use strict"

function VertexNeuron(graph){
	Vertex.call(this, graph)
	this.threshold = 1
}

VertexNeuron.prototype = Object.create(Vertex.prototype)
VertexNeuron.prototype.constructor = VertexNeuron

VertexNeuron.prototype.type = "neuron"

VertexNeuron.prototype.style = new Style({
	color: "darkgray",
})

VertexNeuron.prototype.update = function(options){
	var energy = MathHelper.sum(this.inputs)
	if(energy >= this.threshold)
		for(var neighbor of this.neighbors)
			options.send(neighbor, 1)
	this.inputs = []
}