"use strict"

var Vertex = function(graph){
	this.pos = [0, 0]
	this.motion = [0, 0]
	this.energy = 0
	
	this.graph = graph
}

Vertex.prototype = {
	
	type: "blank",
	
	icon: null,
	symbol: "",
	color: "white",
	textColor: "black",
	border: "black",
	// this.borderStart = 0
	// this.borderEnd = 2*Math.PI
	
	update: function(){},
	
	get neighbors(){
		return this.graph.neighbors(this)
	},
	
	toJSON: function(){
		return {
			type: this.type,
			pos: this.pos,
			motion: this.motion,
			energy: this.energy,
		}
	},
}