"use strict"

function VertexNeuron(graph){
	Vertex.call(this, graph)
	this.threshold = 1
}

VertexNeuron.prototype = Object.create(Vertex.prototype)
VertexNeuron.prototype.constructor = VertexNeuron

VertexNeuron.prototype.color = "darkgray"
VertexNeuron.prototype.type = "neuron"

VertexNeuron.prototype.update = function(options){
	for(var neighbor of this.neighbors)
		if(this.energy >= this.threshold)
			options.send(neighbor, 1)
	
	this.energy = 0
}