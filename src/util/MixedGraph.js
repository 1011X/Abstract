class MixedGraph {
    constructor() {
        this._vertices = new Set
        
        // invariant: all arcs and edges must point to vertices *in the graph*
        this._arcs = new Set
        this._edges = new Set
        
        this._components = new Set
    }
    
    isEmpty() {
        return this._vertices.size === 0
    }
    
    clear() {
        this._arcs.clear()
        this._edges.clear()
        this._vertices.clear()
    }

    get vertices() {
        return this._vertices.values()
    }

    get arcs() {
        return this._arcs.values()
    }
    
    get edges() {
        return this._edges.values()
    }

    add(vertex) {
        this._vertices.add(vertex)
    }

    successorsOf(vertex) {
        let successors = []
        for(let arc of this.arcs) {
            if(arc.from === vertex) {
                successors.push(arc.to)
            }
        }
        return successors
    }

    predecessorsOf(vertex) {
        let predecessors = []
        for(let arc of this.arcs) {
            if(arc.to === vertex) {
                predecessors.push(arc.from)
            }
        }
        return predecessors
    }

    lineageOf(vertex) {
        return this.predecessorsOf(vertex).concat(this.successorsOf(vertex))
    }

    neighborsOf(vertex) {
        let neighbors = []
        for(let edge of this.edges) {
            if(edge.has(vertex)) {
                neighbors.push(edge.complement(vertex))
            }
        }
        return neighbors
    }
    
    connectionsOf(vertex) {
        return this.lineageOf(vertex).concat(this.neighborsOf(vertex))
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

    removeArc(u, v) {
        this._arcs.delete(this.getArc(u, v))
    }

    removeEdge(u, v) {
        this._edges.delete(this.getEdge(u, v))
    }

    delete(vertex) {
        for(let arc of this.arcs) {
            if(arc.from === vertex || arc.to === vertex) {
                this._arcs.delete(arc)
            }
        }
        
        for(let edge of this.edges) {
            if(edge.has(vertex)) {
                this._edges.delete(edge)
            }
        }
        
        this._vertices.delete(vertex)
    }

    setArc(u, v, val) {
        let arc = this.getArc(u, v)
        if(arc !== null) {
            arc.value = val
        }
        else {
            this._arcs.add(new Arc(u, v, val))
        }
    }

    setEdge(u, v, val) {
        let edge = this.getEdge(u, v)
        if(edge !== null) {
            edge.value = val
        }
        else {
            this._edges.add(new Edge(u, v, val))
        }
    }

    toJSON() {
        let vertices = [...this.vertices]
        let arcs = []
        let edges = []
        
        for(let arc of this.arcs) {
            arcs.push([
                vertices.indexOf(arc.from),
                vertices.indexOf(arc.to),
                arc.value
            ])
        }
        
        for(let edge of this.edges) {
            edges.push([
                vertices.indexOf(edge._a),
                vertices.indexOf(edge._b),
            	edge.directed,
                edge.value
            ])
        }
        
        return {vertices, arcs, edges}
    }
    
    static fromJSON(json) {
        let graph = new this
        graph._vertices = new Set(json.vertices)
        
        for(let [from, to, value] of json.arcs) {
            graph._arcs.add(new Arc(
                json.vertices[from],
                json.vertices[to],
                value
            ))
        }
        
        for(let [from, to] of json.edges) {
            let edge = new Edge(json.vertices[from], json.vertices[to])
            graph._edges.add(edge)
        }
        
        return graph
    }
}

class Arc {
    constructor(from, to, val) {
        this.from = from
        this.to = to
        this.value = val
    }
}

class Edge {
    constructor(from, to, directed, val) {
    	this.directed = directed
        this._a = from
        this._b = to
        this.value = val
    }
    
    has(v) {
        return v === this._a || v === this._b
    }
    
    complement(v) {
        if(v === this._a) {
            return this._b
        }
        if(v === this._b) {
            return this._a
        }
        return null
    }
    
    toArray() {
        return [this._a, this._b]
    }
}
