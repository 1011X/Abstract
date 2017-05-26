class MixedGraph {
	constructor() {
		this._vertices = new Set
		this._arcs = new Set
		this._edges = new Set
	}

	// For simplicity's sake, we're assuming any vertex/vertices passed are part of
	// the graph, and that the values used for them are objects.
	get vertices() {
		return this._vertices.values()
	}

	get arcs() {
		return this._arcs.keys()
	}
	
	get edges() {
		return this._edges.keys()
	}

	has(vertex) {
		return this._vertices.has(vertex)
	}

	add(vertex) {
		this._vertices.add(vertex)
	}

	arcNeighbors(vertex) {
		let neighbors = []
		for(let arc of this.arcs) {
			if(arc.from == vertex) {
				neighbors.push(arc.to)
			}
		}
		return neighbors
	}

	edgeNeighbors(vertex) {
		let neighbors = []
		for(let edge of this.edges) {
			if(edge.has(vertex)) {
				neighbors.push(edge.complement(vertex))
			}
		}
		return neighbors
	}

	arcAdjacent(u, v) {
		for(let arc of this.arcs) {
			if(arc.from === u && arc.to === v) {
				return true
			}
		}
		return false
	}

	edgeAdjacent(u, v) {
		for(let edge of this.edges) {
			if(edge.has(u) && edge.has(v)) {
				return true
			}
		}
		return false
	}
	
	adjacent(u, v) {
		return this.arcAdjacent(u, v) || this.edgeAdjacent(u, v)
	}

	getArc(u, v) {
		for(let arc of this.arcs) {
			if(arc.from === u && arc.to === v) {
				return arc
			}
		}
		return null
	}

	getEdge(u, v) {
		for(let edge of this.edges) {
			if(edge.has(u) && edge.has(v)) {
				return edge
			}
		}
		return null
	}

	delete(vertex) {
		for(let neighbor of this.arcNeighbors(vertex)) {
			this.removeArc(vertex, neighbor)
		}
		
		for(let neighbor of this.edgeNeighbors(vertex)) {
			this.removeEdge(vertex, neighbor)
		}
		
		for(let v of this.vertices) {
			if(this.adjacent(v, vertex)) {
				this.removeArc(v, vertex)
				this.removeEdge(v, vertex)
			}
		}
		
		this._vertices.delete(vertex)
	}

	setArc(u, v, val) {
		this._arcs.delete(this.getArc(u, v))
		this._arcs.add(val)
	}

	setEdge(u, v, val) {
		this._edges.delete(this.getEdge(u, v))
		this._edges.add(val)
	}

	removeArc(u, v) {
		this._arcs.delete(this.getArc(u, v))
	}

	removeEdge(u, v) {
		this._edges.delete(this.getEdge(u, v))
	}

	toJSON() {
		let vertices = [...this.vertices]
		let arcs = []
		let edges = []
		
		for(let vertex of this.vertices) {
			for(let neighbor of this.arcNeighbors(vertex)) {
				arcs.push({
					from: vertices.indexOf(vertex),
					to: vertices.indexOf(neighbor),
					value: this.getArc(vertex, neighbor).value,
				})
			}
			
			for(let neighbor of this.edgeNeighbors(vertex)) {
				edges.push({
					from: vertices.indexOf(vertex),
					to: vertices.indexOf(neighbor),
					value: this.getEdge(vertex, neighbor).value,
				})
			}
		}
		
		return {vertices, arcs, edges}
	}
}
