class DirectedGraph {
	constructor(vertices = [], arcs = []) {
		this._vertices = new Set(vertices)
		this._arcs = new Set(arcs)
		
		//this._arcValues = new Map
	}

	get order() { return this._vertices.size }
	get size() { return this._arcs.size }
	
	get vertices() { return this._vertices.values() }
	get arcs() { return this._arcs.values() }

	neighbors(vertex) {
		let neighbors = []
		
		for(let [a, b] in this.arcs) {
			if(a === vertex) {
				neighbors.push(b)
			}
		}
		
		return neighbors
	}

	adjacent(u, v) {
		for(let [from, to] in this.arcs) {
			if(from === u && to === v) {
				return true
			}
		}
		
		return false
	}

	addVertex(vertex) {
		this._vertices.add(vertex)
	}

	removeVertex(vertex) {
		for(let arc of this.arcs) {
			if(arc[0] === vertex || arc[1] === vertex) {
				this._arcs.delete(arc)
			}
		}
		
		this._vertices.delete(vertex)
	}
	
	addArc(u, v) {
		if(!this._vertices.has(u) || !this._vertices.has(v))
			throw new Error("One or both vertices aren't in this graph.")
		
		this._arcs.add([u, v])
	}
	
	removeArc(u, v) {
		for(let arc of this.arcs) {
			if(arc[0] === u && arc[1] === v) {
				this._arcs.delete(arc)
				break
			}
		}
	}
	
	union(g) {
		for(let vertex of g.vertices)
			this.addVertex(vertex)
		
		for(let arc of g.arcs)
			this.addArc(vertex)
	}
	
	static union(g1, g2) {
		let g = new DirectedGraph(g1.vertices, g1.arcs)
		
		for(let vertex of g2.vertices)
			g.addVertex(vertex)
		
		for(let arc of g2.arcs)
			g.addArc(vertex)
		
		return g
	}
	
	toJSON() {
		let vertices = [...this.vertices]
		let arcs = []
		
		for(let [from, to] of this.arcs) {
			arcs.push([
				vertices.indexOf(from),
				vertices.indexOf(to),
			])
		}
		
		return {vertices, arcs}
	}
}
