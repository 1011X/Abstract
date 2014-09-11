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
	this.symbol = ""
	
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


var VertexBlank = function( graph ){
	Vertex.call( this, graph )
}

VertexBlank.prototype = Object.create( Vertex.prototype )

VertexBlank.prototype.color = "white"


var VertexRotator = function( graph ){
	Vertex.call( this, graph )
	this.color = "lightgreen"
}

VertexRotator.prototype = Object.create( Vertex.prototype )
VertexRotator.prototype.update = function( selected ){

	var neighbors = this.graph.getNeighborsByEdge( this )
	
	for( var i = 0, neighbor; neighbor = neighbors[ i ]; ++i ){
		if( neighbor === selected[0] )
			continue
		
		// update() is called 30 times per second, so
		// 2*pi / 30 = pi / 15
		var displace = new Vec2( neighbor.posX - this.posX, neighbor.posY - this.posY )
		displace.rotate( Math.PI/15 * this.energy )
		
		neighbor.posX = this.posX + displace[0]
		neighbor.posY = this.posY + displace[1]
	}
	
	this.energy = 0
}


var VertexGravity = function( graph ){
	Vertex.call( this, graph )
	this.color = "#BE57FF"
}

VertexGravity.prototype = Object.create( Vertex.prototype )
VertexGravity.prototype.update = function( selected ){

	for( var j = 0, vertex2; vertex2 = this.graph.vertices[ j ]; ++j )

		if( vertex2.type == 0 && vertex2 !== selected[0] ){
	
			var normal = new Vec2( this.posX - vertex2.posX, this.posY - vertex2.posY ).normalize()
		
			// var force = G / ( length * length )
		
			vertex2.motionX += normal.x
			vertex2.motionY += normal.y
			vertex2.posX += vertex2.motionX
			vertex2.posY += vertex2.motionY
		}
}


var VertexCharged = function( graph ){
	Vertex.call( this, graph )
}

VertexCharged.prototype = Object.create( Vertex.prototype )
VertexCharged.prototype.update = function( selected ){
	
	for( var j = 0, vertex2; vertex2 = this.graph.vertices[ j ]; ++j )
	
		if( vertex2 !== this && vertex2 !== selected[0]
			&& ( vertex2.type == 3 || vertex2.type == 4 )
		){
			var normal = new Vec2( this.posX - vertex2.posX, this.posY - vertex2.posY ).normalize()
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
			if( vertex2.type == 4 ){
				
				vertex2.motionX += normal[0]
				vertex2.motionY += normal[1]
				
			} else if( vertex2.type == 3 ){
			
				vertex2.motionX -= normal[0]
				vertex2.motionY -= normal[1]
				
			}
			vertex2.posX += vertex2.motionX
			vertex2.posY += vertex2.motionY
		}
}


var VertexChargedPositive = function( graph ){
	VertexCharged.call( this, graph )
	this.color = "red"
	this.energy = 1
}

VertexChargedPositive.prototype = VertexCharged.prototype


var VertexChargedNegative = function( graph ){
	VertexCharged.call( this, graph )
	this.color = "skyblue"
	this.energy = -1
}

VertexChargedNegative.prototype = VertexCharged.prototype


var VertexEnergy = function( graph ){
	Vertex.call( this, graph )
	this.color = "yellow"
	this.energy = 1
}

VertexEnergy.prototype = Object.create( Vertex.prototype )
VertexEnergy.prototype.update = function( selected ){
	var neighbors = this.graph.getNeighborsByArc( this )
	
	for( var i = 0, neighbor; neighbor = neighbors[ i ]; ++i ){
		if( neighbor == selected[0] )
			continue
		neighbor.energy += 1 / neighbors.length
	}
}


var VertexForward = function( graph ){
	Vertex.call( this, graph )
	this.color = "lightpink"
}

VertexForward.prototype = Object.create( Vertex.prototype )
VertexForward.prototype.update = function(){

	var neighbors = this.graph.getNeighborsByArc( this )
	
	for( var i = 0, neighbor; neighbor = neighbors[ i ]; ++i )
		neighbor.energy += this.energy / neighbors.length
	
	this.energy = 0
}


var VertexNeuron = function( graph ){
	Vertex.call( this, graph )
	this.color = "darkgray"
}

VertexNeuron.prototype = Object.create( Vertex.prototype )
VertexNeuron.prototype.update = function(){
	
}
