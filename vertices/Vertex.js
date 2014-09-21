"use strict"

var Vertex = function( graph ){
	this.pos = Vec2.create64()
	this.prevPos = Vec2.create64()
	this.motion = Vec2.create32()
	
	// this.borderStart = 0
	// this.borderLength = 2*Math.PI
	this.text = ""
	this.id = Vertex.id++
	
	this.graph = graph
}

Vertex.id = 0

Vertex.prototype = {
	
	color: "purple",
	border: "black",
	
	setPosition: function( x, y ){
		this.prevPos[0] = this.pos[0]
		this.prevPos[1] = this.pos[1]
		this.pos[0] = x
		this.pos[1] = y
	},
	
	setVelocity: function( x, y ){
		this.motion[0] = x
		this.motion[1] = y
	},
	
	resetPosition: function(){
		this.pos[0] = this.prevPos[0]
		this.pos[1] = this.prevPos[1]
	},
	
	update: function(){},
}