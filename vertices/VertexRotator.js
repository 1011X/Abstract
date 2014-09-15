"use strict"

function VertexRotator( graph ){
	Vertex.call( this, graph )
}

VertexRotator.prototype = Object.create( Vertex.prototype )

VertexRotator.prototype.color = "lightgreen"

VertexRotator.prototype.update = function( selected ){

	var neighbors = this.graph.neighborsByEdge( this )
	
	for( var i = 0; i < neighbors.length; ++i ){
		var neighbor = neighbors[ i ]
		if( neighbor === selected[0] )
			continue
		
		// update() is called 60 times per second, so
		// 2*pi / 60 = pi / 30
		var displace = new Vec2( neighbor.posX - this.posX, neighbor.posY - this.posY )
		displace.rotate( Math.PI/30 * this.energy )
		
		neighbor.posX = this.posX + displace[0]
		neighbor.posY = this.posY + displace[1]
	}
	
	this.energy = 0
}