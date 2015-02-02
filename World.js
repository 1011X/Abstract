function World(){
	this.RAD = 20
	this.graph = new DirectedGraph
	this.cam = [0, 0]
	this.needsUpdate = new Set
}

World.prototype = {
	
	get vertices(){
		return this.graph.vertices
	},
	
	get count(){
		return this.graph.order
	},
	
	vertexAt: function(x, y){
		var vertices = []
		for(var v of this.vertices)
			vertices.push(v)
		// search backwards because last node is drawn on top
		for(var i = this.count - 1; i >= 0; --i){
			var vertex = vertices[i]
			var d = [0, 0]
			Vec2.subtract(vertex.pos, [x, y], d)
			if(Vec2.lengthSqr(d) <= 1)
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
	moveCamTo: function(x, y){
		this.cam[0] = x
		this.cam[1] = y
	},
	*/
	tick: function(selected){
		for(var vertex of this.graph.vertices){
			var self = this
			this.needsUpdate.delete(vertex)
			vertex.update({
				selected: selected,
				send: function(vert, value){
					if(self.graph.adjacent(vertex, vert)){
						vert.energy += value
						self.needsUpdate.add(vert)
					}
				}
			})
		}
	},
	
	toJSON: function(){
		var vertices = []
		var arcs = []
		var needsUpdate = []
		// list vertices in world
		for(var vert of this.graph.vertices)
			vertices.push(vert)
		// list vertices that need updates by index of above list
		for(var vert of this.needsUpdate)
			needsUpdate.push(vertices.indexOf(vert))
		
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
			needsUpdate: needsUpdate,
		}
	},
}