"use strict"

var Vertex = function( graph ){
	this.posX = 0
	this.posY = 0
	this.prevPosX = 0
	this.prevPosY = 0
	this.motionX = 0
	this.motionY = 0
	
	// this.borderStart = 0
	// this.borderLength = 2*Math.PI
	this.text = ""
	
	this.graph = graph
}

Vertex.prototype = {
	
	color: "purple",
	border: "black",
	
	setPosition: function( x, y ){
		this.prevPosX = this.posX
		this.prevPosY = this.posY
		this.posX = x
		this.posY = y
	},
	
	setVelocity: function( x, y ){
		this.motionX = x
		this.motionY = y
	},
	
	resetPosition: function(){
		this.posX = this.prevPosX
		this.posY = this.prevPosY
	},
	
	update: function(){},
}