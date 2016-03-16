class DirectedGraph {
	constructor() {
		// Map of maps of arc values. And holy shit is it useful.
		this._vertices = new Map
		this._arcs = new Set
	}

	// For simplicity's sake, we're assuming any vertex/vertices passed are part of
	// the graph, and that the values used for them are objects.
	get order() {
		return this._vertices.size
	}

	get size() {
		return this._arcs.size
	}

	get vertices() {
		return this._vertices.keys()
	}

	get arcs() {
		return this._arcs.values()
	}

	has(vertex) {
		return this._vertices.has(vertex)
	}

	add(vertex) {
		this._vertices.set(vertex, new Map)
	}

	neighborsOf(vertex) {
		return this._vertices.get(vertex).keys()
	}

	adjacent(u, v) {
		return this._vertices.get(u).has(v)
	}

	getArc(u, v) {
		return this._vertices.get(u).get(v)
	}

	delete(vertex) {
		for(let neighbor of this.neighborsOf(vertex))
			this.removeArc(vertex, neighbor)
		
		for(let v of this.vertices)
			if(this.adjacent(v, vertex))
				this.removeArc(v, vertex)
		
		this._vertices.delete(vertex)
	}

	setArc(u, v, val) {
		this._arcs.delete(this.getArc(u, v))
		this._vertices.get(u).set(v, val)
		this._arcs.add(val)
	}

	removeArc(u, v) {
		this._arcs.delete(this.getArc(u, v))
		this._vertices.get(u).delete(v)
	}

	toJSON() {
		let vertices = []
		let arcs = []
		
		for(let vertex of this.vertices)
			vertices.push(vertex)
		
		for(let vertex of this.vertices)
			for(let neighbor of this.neighborsOf(vertex)) {
				let value = this.getArc(vertex, neighbor)
				
				arcs.push({
					from: vertices.indexOf(vertex),
					to: vertices.indexOf(neighbor),
					value: value,
				})
			}
		
		return {vertices, arcs}
	}
}
