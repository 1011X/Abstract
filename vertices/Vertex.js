"use strict"

var Vertex = function(graph){
	this.pos = [0, 0]
	this.motion = [0, 0]
	this.inputs = []
	
	this.graph = graph
	this.id = Vertex.id++
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
	
	get neighbors(){
		return this.graph.neighbors(this)
	},
	
	update: function(){},
	
	action: function(){},
	
	toJSON: function(){
		return {
			type: this.type,
			pos: this.pos,
			motion: this.motion,
			inputs: this.inputs,
		}
	},
}

Vertex.id = 0