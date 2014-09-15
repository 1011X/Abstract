"use strict"

var VertexChargedNegative = function( graph ){
	VertexCharged.call( this, graph )
	this.energy = -1
}

VertexChargedNegative.prototype = Object.create( VertexCharged.prototype )

VertexChargedNegative.prototype.color = "skyblue"