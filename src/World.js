class World {
	constructor() {
		this.graph = new DirectedGraph
		this.cam = new Vec2
		this.markedForUpdates = new Set
	}
	
	get vertices() {
		return this.graph.vertices
	}
	
	vertexAt(pos) {
		// search backwards because last node is drawn on top
		let vertices = [...this.vertices].reverse()
		
		for(let vertex of vertices) {
			let d = vertex.pos.clone().subtract(pos)
			
			if(d.lensqr <= vertex.radius * vertex.radius) {
				return vertex
			}
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
	
	toJSON() {
		let vertices = [...this.graph.vertices]
		let markedForUpdates = [...this.markedForUpdates]
		let arcs = []
		
		for(let arc of this.graph.arcs) {
			let from = vertices.indexOf(arc.from)
			let to = vertices.indexOf(arc.to)
			
			arcs.push({from, to, value: arc})
		}
		
		return {
			cam: this.cam.toArray(),
			vertices,
			arcs,
			markedForUpdates,
		}
	}
}
