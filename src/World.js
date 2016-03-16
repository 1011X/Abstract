class World {
	constructor() {
		this.RAD = 20
		this.graph = new DirectedGraph
		this.cam = [0, 0]
		this.markedForUpdates = new Set
	}
	
	get vertices() {
		return this.graph.vertices
	}
	
	get count() {
		return this.graph.order
	}
	
	vertexAt(pos) {
		let vertices = []
		
		for(let v of this.vertices)
			vertices.push(v)
		
		// search backwards because last node is drawn on top
		vertices.reverse()
		for(let vertex of vertices) {
			let d = Vec2.subtract(vertex.pos, pos)
			
			if(Vec2.length(d) <= this.RAD)
				return vertex
		}
		
		return null
	}
	
	spawn(vertex) {
		this.graph.add(vertex)
	}
	
	despawn(vertex) {
		this.graph.delete(vertex)
	}
	
	connect(u, v, val) {
		this.graph.setArc(u, v, val)
	}
	
	disconnect(u, v) {
		this.graph.deleteArc(u, v)
	}
	/*
	moveCamTo(pos) {
		this.cam[0] = pos[0]
		this.cam[1] = pos[1]
	}
	*/
	tick(selected) {
		// Loops through all vertices. Don't do this!
		// .markedForUpdates is there for a reason!
		for(let vertex of this.graph.vertices) {
			this.markedForUpdates.delete(vertex)
			vertex.update({
				selected,
				send: (vert, value) => {
					if(this.graph.adjacent(vertex, vert)) {
						vert.inputs.push(value)
						this.markedForUpdates.add(vert)
					}
				}
			})
		}
	}
	
	toJSON(){
		let vertices = []
		let arcs = []
		let markedForUpdates = []
		
		// list vertices in world
		for(let vert of this.graph.vertices)
			vertices.push(vert)
		
		// list vertices that need updates by index of above list
		for(let vert of this.markedForUpdates)
			markedForUpdates.push(vertices.indexOf(vert))
		
		for(let arc of this.graph.arcs) {
			let from = vertices.indexOf(arc.from)
			let to = vertices.indexOf(arc.to)
			
			arcs.push({from, to, value: arc})
		}
		
		return {
			cam: this.cam,
			vertices,
			arcs,
			markedForUpdates,
		}
	}
}
