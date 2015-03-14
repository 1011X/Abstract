"use strict"

var Vertex = function(graph){
	this.pos = [0, 0]
	this.motion = [0, 0]
	this.inputs = []
	
	this.graph = graph
}

Vertex.prototype = {
	
	type: "blank",
	
	style: new Style,
	
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