class World {
    constructor() {
        this.cam = new Vec2(0, 0)
        //this.markForUpdate = new Set
        
        this.graph = new MixedGraph
        this.ticks = 0
        this.components = null
        this.needsUpdate = true
        
        // vertex clicked on mousedown
        this.selected = null
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
		//this.components.add(new Set().add(vertex))
		//this.markForUpdate(vertex)
	}
	
	despawn(vertex) {
		this.graph.delete(vertex)
		//this.calculateComponents()
	}
    
    arcConnect(u, v) {
        this.graph.setArc(u, v, 0)
		//this.calculateComponents()
		// TODO should be:
		// union component of u and component of v
        //this.markForUpdate(u)
        //this.markForUpdate(v)
    }
    
    edgeConnect(u, v) {
        let len = v.pos.clone().sub(u.pos).len
        this.graph.setEdge(u, v, len)
		//this.calculateComponents()
		// TODO should be:
		// union component of u and component of v
        //this.markForUpdate(u)
        //this.markForUpdate(v)
    }
    
    // disconnects any connections that intersect with the line given by the
    // 2 endpoints. the order of the endpoints doesn't matter.
    // for an easy explanation of how this is done, refer to this:
    // https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect#565282
    // Note: only the last 3 cases are checked (no collinearity is checked bc
    // that would be *very* difficult to achieve in-game)
    intersectingConnections(a, b) {
        let cut_offset = a.clone().sub(b) // r
        let intersects = new WeakSet
        
        for(let edge of this.graph.edges) {
            let [from, to] = edge.toArray().map(v => v.pos)
            let edge_offset = to.clone().sub(from) // s
            
            let offset_cross = Vec2.cross(cut_offset, edge_offset)
            // parallel; no intersection
            // you: but collinea—
            // me: shhhhhhhhhh
            if(offset_cross == 0) {
                continue
            }
            
            let start_offset = from.clone().sub(a)
            let t = Vec2.cross(start_offset, edge_offset) / offset_cross
            let u = Vec2.cross(start_offset, cut_offset) / offset_cross
            
            if(0 <= t && t <= 1 && 0 <= u && u <= 1) {
                // intersects!
                intersects.add(edge)
            }
        }
        
        for(let arc of this.graph.arcs) {
            let arc_offset = arc.to.pos.clone().sub(arc.from.pos) // s
            
            let offset_cross = Vec2.cross(cut_offset, arc_offset)
            // parallel; no intersection
            // you: but collinea—
            // me: shhhhhhhhhh
            if(offset_cross == 0) {
                continue
            }
            
            let start_offset = arc.from.pos.clone().sub(a)
            let t = Vec2.cross(start_offset, arc_offset) / offset_cross
            let u = Vec2.cross(start_offset, cut_offset) / offset_cross
            
            if(0 <= t && t <= 1 && 0 <= u && u <= 1) {
                // intersects!
                intersects.add(arc)
            }
        }
        
        return intersects
    }
    
    disconnectIntersecting(a, b) {
        let cut_offset = a.clone().sub(b) // r
        
        for(let edge of this.graph.edges) {
            let [from, to] = edge.toArray().map(v => v.pos)
            let edge_offset = to.clone().sub(from) // s
            
            let offset_cross = Vec2.cross(cut_offset, edge_offset)
            // parallel; no intersection
            // you: but collinea—
            // me: shhhhhhhhhh
            if(offset_cross == 0) {
                continue
            }
            
            let start_offset = from.clone().sub(a)
            let t = Vec2.cross(start_offset, edge_offset) / offset_cross
            let u = Vec2.cross(start_offset, cut_offset) / offset_cross
            
            if(0 <= t && t <= 1 && 0 <= u && u <= 1) {
                // intersects!
                this.graph.removeEdge(edge.from, edge.to)
            }
        }
        
        for(let arc of this.graph.arcs) {
            let arc_offset = arc.to.pos.clone().sub(arc.from.pos) // s
            
            let offset_cross = Vec2.cross(cut_offset, arc_offset)
            // parallel; no intersection
            // you: but collinea—
            // me: shhhhhhhhhh
            if(offset_cross == 0) {
                continue
            }
            
            let start_offset = arc.from.pos.clone().sub(a)
            let t = Vec2.cross(start_offset, arc_offset) / offset_cross
            let u = Vec2.cross(start_offset, cut_offset) / offset_cross
            
            if(0 <= t && t <= 1 && 0 <= u && u <= 1) {
                // intersects!
                this.graph.removeArc(arc.from, arc.to)
            }
        }
    }
    
    calculateComponents() {
        let components = new Set
        // helper closure to see if given vertex is already accounted for
        let already_counted = v => components.size > 0 && [...components].some(g => g.has(v))
        
        for(let vertex of this.vertices) {
            if(already_counted(vertex)) {
                continue
            }
            
            // add vertex with set and start with that
            let component = new Set
            component.add(vertex)
            
            // get connections of each vertex and add them to the component set.
            // once this is done, we'll have the whole component!
            for(let vertex of component) {
                for(let connection of this.graph.connectionsOf(vertex)) {
                    component.add(connection)
                }
            }
            
            components.add(component)
        }
        
        this.components = components
    }
    
    getNearbyVertices(vertex, r) {
        let near = []
        for(let other of this.vertices) {
            let distance = other.pos.clone().sub(vertex.pos).lensqr
            if(distance <= r ** 2 && other !== vertex) {
                near.push(other)
            }
        }
        return near
    }
    // TODO Change update mechanism; flip-flops don't become unstable when they
    // are turned on at the same time. yes, that's desired behavior.
    tick() {
        for(let vertex of this.vertices) {
            let world = this
            let handler = {
                // for memoization reasons
                memoInputs: undefined,
                memoNeighbors: undefined,
                needsUpdate: false,
                
                // gather list input values
                get inputs() {
                    if(this.memoInputs === undefined) {
                        this.memoInputs = []
                        for(let arc of world.graph.arcs) {
                            if(arc.to === vertex) {
                                this.memoInputs.push(arc.value)
                            }
                        }
                    }
                    return this.memoInputs
                },
                
                get neighbors() {
                    if(!this.memoNeighbors) {
                        this.memoNeighbors = [...world.graph.neighborsOf(vertex)]
                    }
                    return this.memoNeighbors
                },
                
                nearby(r) {
                    return world.getNearbyVertices(vertex, r)
                },
                
                arcConnectFrom(v) {
                    world.arcConnect(v, vertex)
                },
                
                arcConnectTo(v) {
                    world.arcConnect(vertex, v)
                },
                
                edgeConnectWith(v) {
                    world.edgeConnect(vertex, v)
                },
            }
            
            let out = vertex.update(handler) || 0
            
            // update value in arcs
            for(let successor of this.graph.successorsOf(vertex)) {
                this.graph.setArc(vertex, successor, out)
            }
            
            // check that all vertices still have a valid position and motion,
            // and if not, remove them.
            if(isNaN(vertex.motion.x) || isNaN(vertex.motion.y)) {
                this.graph.delete(vertex)
                console.warn('deleting vertex with invalid motion: ', vertex)
            }
            if(isNaN(vertex.pos.x) || isNaN(vertex.pos.y)) {
                this.graph.delete(vertex)
                console.warn('deleting vertex with invalid position: ', vertex)
            }
            
            // TODO better physics
            // handle collisions; remember they're run twice for both vertices
            for(let v of this.getNearbyVertices(vertex, 24 * 2)) {
                let vec = vertex.pos.clone().sub(v.pos)
                let overlap = 24 * 2 - vec.len
                
                // TODO something different for Anchor?
                vec.resize(overlap / 4)
                
                // make sure it's not currently being held or an Anchor
                // TODO don't use `selected` here
                if(vertex !== this.selected || vertex instanceof Vertex.Anchor) {
                    vertex.motion.add(vec)
                }
                
                vec.reverse()
                
                if(v !== this.selected || v instanceof Vertex.Anchor) {
                    v.motion.add(vec)
                }
            }
            
            // update its position and motion
            vertex.pos.add(vertex.motion)
            vertex.motion.scale(0.90)
            
            // if motion is slow enough, stop it completely
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
        //world.calculateComponents()
        
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
