"use strict"

function VertexEnergy( graph ){
	Vertex.call( this, graph )
	this.energy = 1
}

VertexEnergy.prototype = Object.create( Vertex.prototype )

VertexEnergy.prototype.color = "yellow"

VertexEnergy.prototype.update = function( selected ){
	var neighbors = this.graph.neighborsByArc( this )
	
	for( var i = 0, neighbor; neighbor = neighbors[ i ]; ++i ){
		if( neighbor == selected[0] )
			continue
		neighbor.energy += 1 / neighbors.length
	}
}