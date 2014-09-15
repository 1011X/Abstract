"use strict"

function VertexExtend( graph ){
	Vertex.call( this, graph )
}

VertexExtend.prototype = Object.create( Vertex.prototype )

VertexExtend.prototype.color = "lightpink"

VertexExtend.prototype.update = function(){
	var neighbors = this.graph.neighborsByArc( this )
	for( var i = 0; i < neighbors.length; ++i ){
		var neighbor = neighbors[ i ]
		neighbor.energy += this.energy / neighbors.length
	}
	this.energy = 0
}