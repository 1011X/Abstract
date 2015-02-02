"use strict"

function DirectedGraph(){
	// Map of maps of arc values. And holy shit is it useful.
	this._vertices = new Map
	this._arcs = new Set
}

// For simplicity's sake, we're assuming any vertex/vertices passed are part of
// the graph, and that the values used for them are objects.

DirectedGraph.prototype = {
	
	get order(){
		return this._vertices.size
	},
	
	get size(){
		return this._arcs.size
	},
	
	get vertices(){
		return this._vertices.keys()
	},
	
	get arcs(){
		return this._arcs.values()
	},
	
	has: function(vertex){
		return this._vertices.has(vertex)
	},
	
	add: function(vertex){
		this._vertices.set(vertex, new Map)
	},
	
	delete: function(vertex){
		for(var n of this.neighbors(vertex))
			this.removeArc(vertex, n)
		for(var v of this.vertices)
			if(this.adjacent(v, vertex))
				this.removeArc(v, vertex)
		this._vertices.delete(vertex)
	},
	
	neighbors: function(vertex){
		return this._vertices.get(vertex).keys()
	},
	
	adjacent: function(u, v){
		return this._vertices.get(u).has(v)
	},
	
	getArc: function(u, v){
		return this._vertices.get(u).get(v)
	},
	
	setArc: function(u, v, val){
		this._arcs.delete(this.getArc(u, v))
		this._vertices.get(u).set(v, val)
		this._arcs.add(val)
	},
	
	removeArc: function(u, v){
		this._arcs.delete(this.getArc(u, v))
		this._vertices.get(u).delete(v)
	},
	
	toJSON: function(){
		var vertices = []
		var arcs = []
		for(var vertex of this._vertices.keys())
			vertices.push(vertex)
		for(var vertex of this._vertices.keys())
			for(var neighbor of this.neighbors(vertex)){
				var value = this.getArc(vertex, neighbor)
				arcs.push({
					from: vertices.indexOf(vertex),
					to: vertices.indexOf(neighbor),
					value: value
				})
			}
		return {
			vertices: vertices,
			arcs: arcs
		}
	},
}