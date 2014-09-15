"use strict"

function VertexGravity( graph ){
	Vertex.call( this, graph )
}

VertexGravity.prototype = Object.create( Vertex.prototype )

VertexGravity.prototype.color = "#BE57FF"

VertexGravity.prototype.update = function( selected ){
	for( var i = 0; i < this.graph.order; ++i ){
		var vertex = this.graph.vertices[ i ]
		if( vertex.type == 0 && vertex !== selected[0] ){
			var normal = Vec2.normalize( [ this.posX - vertex.posX, this.posY - vertex.posY ] )
			// var force = G / ( length * length )
			vertex.motionX += normal.x
			vertex.motionY += normal.y
			vertex.posX += vertex.motionX
			vertex.posY += vertex.motionY
		}
	}
}