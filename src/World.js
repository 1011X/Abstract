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
	// TODO Improve update mechanism; seems to update weirdly
	// (eg, glitches, previously unseen behavior, etc.).
	tick() {
		for(let vertex of this.vertices) {
			let neighbors = [...this.graph.arcNeighbors(vertex)]
			let outs = neighbors.map(_ => 0)
			let ins = []
			
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
		let graph = this.graph.toJSON()
		
		// set vertex type on the object to know which constructor to
		// call when deserializing
		graph.vertices = graph.vertices.map(v => {
			let vertex = v.toJSON()
			vertex.type = Vertex.registry.getName(v.constructor)
			return vertex
		})
		
		// ugh, no valid representation for IEEE NaN and Infinity
		// in JSON, so convert them to strings
		for(let arc of graph.arcs) {
			switch(arc[2]) {
				case Infinity: arc[2] = "inf"; break;
				case -Infinity: arc[2] = "-inf"; break;
				case NaN: arc[2] = "nan"; break;
			}
		}
		
		return {cam: this.cam, graph}
	}
	
	static fromJSON(json) {
		let world = new World
		world.cam = new Vec2(...json.cam)
		
		// convert json.graph.vertices into regular vertex objects
		// from the provided type in json
		let vertices = []
		for(let vertObj of json.graph.vertices) {
			let vertexClass = Vertex.registry.get(vertObj.type)
			let vertex = vertexClass.fromJSON(vertObj)
			vertices.push(vertex)
		}
		json.graph.vertices = vertices
		
		// turn back string values to numeric values
		for(let arc of json.graph.arcs) {
			switch(arc[2]) {
				case "inf": arc[2] = Infinity; break;
				case "-inf": arc[2] = -Infinity; break;
				case "nan": arc[2] = NaN; break;
			}
		}
		
		world.graph = MixedGraph.fromJSON(json.graph)
		
		// can also check if any previous arcs will update their
		// next vertex, and add those to `.markedForUpdate`.
		
		//let markedForUpdates = []
		//for(let vertObj of data.markedForUpdates) {
			//markedForUpdates.push(vertices[vertObj])
		//}
		
		//world.markedForUpdates = new Set(markedForUpdates)
		
		return world
	}
}
