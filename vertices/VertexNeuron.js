"use strict"

function VertexNeuron( graph ){
	Vertex.call( this, graph )
}

VertexNeuron.prototype = Object.create( Vertex.prototype )

VertexNeuron.prototype.color = "darkgray"