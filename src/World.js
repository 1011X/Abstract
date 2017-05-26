class World {
	constructor() {
		this.graph = new MixedGraph
		this.cam = new Vec2
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
	
	arcConnect(u, v, val) {
		this.graph.setArc(u, v, val)
	}
	
	edgeConnect(u, v, val) {
		this.graph.setEdge(u, v, val)
	}
	
	disconnect(u, v) {
		this.graph.deleteArc(u, v)
		this.graph.deleteEdge(u, v)
	}
	/*
	moveCamTo(pos) {
		this.cam.cloneFrom(pos)
	}
	*/
	// TODO change update mechanism; it seems to be updating
	// weirdly (eg, glitches in updates, changes that weren't in
	// the previous update mechanism, etc.)
	tick() {
		for(let vertex of this.vertices) {
			let neighbors = [...this.graph.arcNeighbors(vertex)]
			let outs = neighbors.map(_ => 0)
			let ins = []
			
			// TODO uh, do this better somehow
			for(let arc of this.graph.arcs) {
				if(arc.to === vertex) {
					ins.push(arc.value)
				}
			}
			
			vertex.update(ins, outs)
			
			for(let i = 0; i < neighbors.length; i++) {
				let arc = this.graph.getArc(vertex, neighbors[i])
				arc.value = outs[i]
			}
		}
	}
	
	toJSON() {
		return {
			cam: this.cam.toArray(),
			graph: this.graph,
		}
	}
	
	static fromJSON(json) {
		//let data = JSON.parse(localStorage["abstractWorldData"])
		world.cam = new Vec2(...json.cam)
		world.graph = DirectedGraph.fromJSON(json.graph)
		
		let vertices = []
		for(let vertObj of json.vertices) {
			let vertexClass = Vertices.get(vertObj.type)
			
			if(vertexClass !== null) {
				let vertex = new vertexClass(world.graph)
				vertex.pos = new Vec2(...vertObj.pos)
				vertex.motion = new Vec2(...vertObj.motion)
				vertices.push(vertex)
				world.graph.add(vertex)
			}
		}
		
		// rather than do it like this, check if any previous
		// arcs will update the vertex they point to, and add
		// those to `.markedForUpdate`.
		
		//let markedForUpdates = []
		//for(let vertObj of data.markedForUpdates) {
			//markedForUpdates.push(vertices[vertObj])
		//}
		
		//world.markedForUpdates = new Set(markedForUpdates)
		
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
