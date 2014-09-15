"use strict"

function VertexBlank( graph ){
	Vertex.call( this, graph )
}

VertexBlank.prototype = Object.create( Vertex.prototype )

VertexBlank.prototype.color = "white"