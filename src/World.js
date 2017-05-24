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
			let d = vertex.pos.clone().sub(pos)
			
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
	
	static fromJSON(json) {
		//let data = JSON.parse(localStorage["abstractWorldData"])
		world.cam = new Vec2(...json.cam)
		
		let vertices = []
		for(let vertObj of json.vertices) {
			let vertexClass = Vertices.get(vertObj.type)
			
			if(vertexClass !== null) {
				let vertex = new vertexClass(world.graph)
				vertex.pos = new Vec2(...vertObj.pos)
				vertex.motion = new Vec2(...vertObj.motion)
				vertex.inputs = vertObj.inputs
				vertices.push(vertex)
				world.graph.add(vertex)
			}
		}
		
		let markedForUpdates = []
		for(let vertObj of data.markedForUpdates) {
			markedForUpdates.push(vertices[vertObj])
		}
		
		world.markedForUpdates = new Set(markedForUpdates)
		
		let arcs = []
		for(let arcObj of data.arcs) {
			let from = vertices[arcObj.from]
			let to = vertices[arcObj.to]
			let arc = new Arc(from, to)
			arc.weight = arcObj.value.weight
			arc.delay = arcObj.value.delay
			arcs.push(arc)
			world.graph.setArc(from, to, arc)
		}
	}
}
