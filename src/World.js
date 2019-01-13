class World {
    constructor() {
        this.cam = new Vec2
        //this.markForUpdate = new Set
        
        this.graph = new MixedGraph
        this.ticks = 0
    }
    
    get vertices() {
        return this.graph.vertices
    }
    
    vertexAt(pos) {
        // search backwards because last node is drawn on top
        let vertices = [...this.vertices].reverse()
        
        for(let vertex of vertices) {
            let d = vertex.pos.clone().sub(pos)
            
            if(d.lensqr <= vertex.radius ** 2) {
                return vertex
            }
        }
        
        return null
    }
	
	spawn(vertex) {
		this.graph.add(vertex)
		//this.markForUpdate(vertex)
	}
	
	despawn(vertex) {
		this.graph.delete(vertex)
	}
    
    arcConnect(u, v, val) {
        this.graph.setArc(u, v, val)
        //this.markForUpdate(u)
    }
    
    edgeConnect(u, v, val) {
        this.graph.setEdge(u, v, val)
        //this.markForUpdate(u)
        //this.markForUpdate(v)
    }
    /*
    moveCamTo(pos) {
        this.cam.cloneFrom(pos)
    }
    */
    // TODO Change update mechanism; flip-flops don't become unstable when they
    // are turned on at the same time.
    tick() {
        for(let vertex of this.vertices) {
            let world = this
            let handler = {
                // for memoization reasons
                memo_inputs: undefined,
                memo_neighbors: undefined,
                
                // gather list input values
                get inputs() {
                    if(this.memo_inputs === undefined) {
                        this.memo_inputs = []
                        for(let arc of world.graph.arcs) {
                            if(arc.to === vertex) {
                                this.memo_inputs.push(arc.value)
                            }
                        }
                    }
                    return this.memo_inputs
                },
                
                get neighbors() {
                    if(!this.memo_neighbors) {
                        this.memo_neighbors = [...world.graph.neighborsOf(vertex)]
                    }
                    return this.memo_neighbors
                }
            }
            
            let out = vertex.update(handler) || 0
            
            // update value in arcs
            for(let successor of this.graph.successorsOf(vertex)) {
                this.graph.setArc(vertex, successor, out)
            }
            
            // check that all vertices still have a valid position, and if not,
            // remove them.
            // FIXME whatever triggers this
            if(isNaN(vertex.pos.x) || isNaN(vertex.pos.y)) {
                this.graph.delete(vertex)
                console.warn('deleted nan vertex: ', vertex)
            }
            
            // update physics
            // TODO calculate physics component-wise.
            vertex.pos.add(vertex.motion)
            vertex.motion.scale(0.95)
            
            if(vertex.motion.lensqr < 0.1 ** 2) {
                vertex.motion.cloneFrom(Vec2.NULL)
            }
            
            // TODO handle edge constraints
        }
        this.ticks += 1
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
        
        for(let arc of graph.arcs) {
            if(arc[2] == Infinity) {
                arc[2] = 'inf'
            }
            else if(arc[2] == -Infinity) {
                arc[2] = '-inf'
            }
            // no nans can survive
            else if(isNaN(arc[2])) {
                arc[2] = 0
            }
        }
        
        return {cam: this.cam, graph}
    }
    
    static fromJSON(json) {
        let world = new World
        world.cam = new Vec2(...json.cam)
        
        // convert json.graph.vertices into regular vertex
        // objects from the provided type in json
        let vertices = []
        for(let vertObj of json.graph.vertices) {
            let vertexClass = Vertex.registry.get(vertObj.type)
            delete vertObj.type
            let vertex = vertexClass.fromJSON(vertObj)
            vertices.push(vertex)
        }
        json.graph.vertices = vertices
        
        // turn back string values to numeric values
        for(let arc of json.graph.arcs) {
            switch(arc[2]) {
                case "inf": arc[2] = Infinity; break;
                case "-inf": arc[2] = -Infinity; break;
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
