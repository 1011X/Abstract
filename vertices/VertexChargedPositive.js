"use strict"

function VertexChargedPositive( graph ){
	VertexCharged.call( this, graph )
	this.energy = 1
}

VertexChargedPositive.prototype = Object.create( VertexCharged.prototype )

VertexChargedPositive.prototype.color = "red"