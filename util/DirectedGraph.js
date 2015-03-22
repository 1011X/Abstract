"use strict"

function DirectedGraph(){
	this.components = new Set
}

function DirectedGraphComponent(){
	// Map of maps of arc values. And holy shit is it useful.
	// That is, assuming it's implemented correctly and search, insert, and
	// delete are O(1)...
	this._vertices = new Map
}

// For simplicity's sake, we're assuming any vertex/vertices passed are part of
// the graph, and that the values used for them are objects.

DirectedGraph.prototype = {
	
	get components(){
		var components = []
		
		for(var vertex of this.vertices){
			var visited = false
			
			for(var component of components)
				if(component.has(vertex)){
					visited = true
					break
				}
			
			if(visited)
				continue
			
			components.push(this.calculateComponent(vertex))
		}
		
		return components
	},
	
	find: function(vertex){
		for(var component of this.components)
			if(component.has(vertex))
				return component
	},
	
	union: function(first, second){
		if(first === second)
			return first
		
		var sum1 = first.order + first.size
		var sum2 = second.order + second.size
		
		var firstIsSmaller = sum1 < sum2
		
		var smaller = firstIsSmaller ? first : second
		var bigger = firstIsSmaller ? second : first
		
		// NOTE: Depends on Arc's .from and .to properties
		for(var vertex of smaller.vertices)
			bigger.add(vertex)
		for(var arc of smaller.arcs)
			bigger.setArc(arc.from, arc.to, arc)
		
		this.removeComponent(smaller)
		
		return bigger
	}, ///
	
	addComponent: function(vertex){
		var graph = new DirectedGraphComponent
		graph._vertices.set(vertex, new Map)
		this.components.add(graph)
	},
	
	// FIXME: Can only determine outbound neighbors, not inbounds, so multiple
	// and partial components are made.
	calculateComponent: function(vertex){
		var component = new DirectedGraph
		var visited = new Set
		var willVisit = new Set
		
		component.add(vertex)
		willVisit.add(vertex)
		
		for(var vertex of willVisit){
			for(var neighbor of this.neighbors(vertex)){
				if(!visited.has(neighbor) && !willVisit.has(neighbor)){
					component.add(neighbor)
					willVisit.add(neighbor)
				}
				
				component.setArc(vertex, neighbor, this.getArc(vertex, neighbor))
			}
			
			visited.add(vertex)
			willVisit.delete(vertex)
		}
		
		return component
	},
	
	// TODO: implement.
	removeVertex: function(vertex){},
	
	removeComponent: function(component){
		this.components.delete(component)
	},
	
	setArc: function(u, v, val){
		var component = this.union(u, v)
		component.get(u).set(v, val)
	},
	
	getArc: function(u, v){
		var component = this.find(u)
		if(component === this.find(v))
			return component.get(u).get(v)
	},
	
	removeArc: function(u, v){
		var component = this.find(u)
		
		if(component === this.find(v))
			return
		
		component.get(u).delete(v)
	},
	
	adjacent: function(u, v){
		var component = this.find(u)
		if(component !== this.find(v))
			return false
		return component.get(u).has(v)
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

DirectedGraphComponent.prototype = {
	
	get order(){
		return this._vertices.size
	},
	
	get size(){
		return this.arcs.length
	},
	
	get vertices(){
		return this._vertices.keys()
	},
	
	get arcs(){
		var arcList = []
		for(var neighborMap of this._vertices.values())
			for(var arc of neighborMap.values())
				arcList.push(arc)
		return arcList
	},
	
	get: function(vertex){
		return this._vertices.get(vertex)
	},
	
	has: function(vertex){
		return this._vertices.has(vertex)
	},
	
	neighbors: function(vertex){
		return this._vertices.get(vertex).keys()
	},
	
	delete: function(vertex){
		for(var n of this.neighbors(vertex))
			this.removeArc(vertex, n)
		for(var v of this.vertices)
			if(this.adjacent(v, vertex))
				this.removeArc(v, vertex)
		this._vertices.delete(vertex)
	},
	
	adjacent: function(u, v){
		return this._vertices.get(u).has(v)
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