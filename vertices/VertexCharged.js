"use strict"

function VertexCharged( graph ){
	Vertex.call( this, graph )
}

VertexCharged.prototype = Object.create( Vertex.prototype )

VertexCharged.prototype.update = function( selected ){
	/*	TODO: REMOVE THIS!
		This sort of stuff is best left for the World object to handle */
	for( var i = 0; i < this.graph.order; ++i ){
		var vertex = this.graph.vertices[ i ]
		if( vertex !== this && vertex !== selected[0]
			&& ( vertex.type == 3 || vertex.type == 4 )
		){
			var normal = Vec2.normalize( [ this.posX - vertex.posX, this.posY - vertex.posY ] )
			/**
			 * Attracts opposite charges and repels like charges.
			 * TODO: Determine this mathematically using this.energy so it
			 * works for both subclasses.
			 *
			 * The code here applies for positive charges.
			 * 
			 * Just switch around vertex2.type == 4 and vertex2.type == 3
			 * to get the code for negative charges.
			 */
			if( vertex.type == 4 ){
				vertex.motionX += normal[0]
				vertex.motionY += normal[1]
			} else if( vertex.type == 3 ){
				vertex.motionX -= normal[0]
				vertex.motionY -= normal[1]
			}
			vertex.posX += vertex.motionX
			vertex.posY += vertex.motionY
		}
	}
}