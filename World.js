function World(){
	this.RAD = 20
	this.graph = new DirectedGraph
	this.cam = new Vec2
	this.markedForUpdate = new Set
}

World.prototype = {
	
	get vertices(){
		return this.graph.vertices
	},
	
	get count(){
		return this.graph.order
	},
	
	vertexAt: function(pos){
		var vertices = []
		for(var v of this.vertices)
			vertices.push(v)
		vertices.reverse()
		// search backwards because last node is drawn on top
		for(var vertex of vertices){
			var distance = new Vec2
			vertex.pos.subtract(pos, distance)
			if(distance.length <= world.RAD)
				return vertex
		}
		return null
	},
	
	spawn: function(vertex){
		this.graph.add(vertex)
	},
	
	despawn: function(vertex){
		this.graph.delete(vertex)
	},
	
	connect: function(u, v, val){
		this.graph.setArc(u, v, val)
	},
	
	disconnect: function(u, v){
		this.graph.deleteArc(u, v)
	},
	/*
	moveCamTo: function(pos){
		this.cam[0] = pos[0]
		this.cam[1] = pos[1]
	},
	*/
	tick: function(selected){
		// Loops through all vertices. Don't do this!
		// .markedForUpdates is there for a reason!
		for(var vertex of this.graph.vertices){
			var self = this
			this.markedForUpdate.delete(vertex)
			vertex.update({
				selected: selected,
				send: function(vert, value){
					if(self.graph.adjacent(vertex, vert)){
						vert.energy += value
						self.markedForUpdate.add(vert)
					}
				}
			})
		}
	},
	
	toJSON: function(){
		var vertices = []
		var arcs = []
		var markedForUpdate = []
		// list vertices in world
		for(var vert of this.graph.vertices)
			vertices.push(vert)
		// list vertices that need updates by index of above list
		for(var vert of this.markedForUpdate)
			markedForUpdate.push(vertices.indexOf(vert))
		
		for(var arc of this.graph.arcs){
			var from = vertices.indexOf(arc.from)
			var to = vertices.indexOf(arc.to)
			arcs.push({
				from: from,
				to: to,
				value: arc,
			})
		}
		return {
			cam: this.cam,
			vertices: vertices,
			arcs: arcs,
			markedForUpdate: markedForUpdate,
		}
	},
}