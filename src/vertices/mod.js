Vertex = Object.create(null)
Vertex.registry = new RegistryWithDefault("none")

////////////////////////////////////////////////////////////////////////////////

Vertex.Base = class {
	constructor() {
		this.pos = new Vec2(0, 0)
		this.motion = new Vec2(0, 0)
		//this.angle = 0
	}
	
	update(handler) {
	    return 0
	}
	
	action() {
	}
	
	toJSON() {
		return Object.assign({}, this)
	}
	
	static fromJSON(json) {
		let vertex = new this
		vertex.pos = new Vec2(...json.pos)
		vertex.motion = new Vec2(...json.motion)
		return vertex
	}
}

Vertex.Base.prototype.radius = 24
Vertex.Base.prototype.style = new VertexStyle("black")

////////////////////////////////////////////////////////////////////////////////

Vertex.Anchor = class extends Vertex.Base {
	update(h) {
	    this.motion.scale(0)
	    return 0
	}
}

Vertex.Anchor.prototype.style = new VertexStyle("lightblue", {
	symbol: "⚓",
	textColor: "white",
})

////////////////////////////////////////////////////////////////////////////////

Vertex.Degree = class extends Vertex.Base {
    constructor() {
        super()
        this.style = new VertexStyle("white", {symbol: "0"})
    }
    
    update(h) {
        let degree = h.neighbors.length
        this.style.symbol = degree.toString()
        return degree
    }
}

Vertex.Degree.prototype.style = new VertexStyle("white", {symbol: "deg"})

////////////////////////////////////////////////////////////////////////////////

Vertex.Fruit = class extends Vertex.Base {
	constructor() {
		super()
		this.pool = 0
	}
	
	get radius() {
		// the `+ 25` is the initial area, which must exist so players can
		// actually interact with the vertex.
		return Math.sqrt((this.pool + 100) / Math.PI)
	}
	
	update(handler) {
		this.pool += handler.inputs.reduce((acc, val) => acc + val, 0)
	    return 0
	}
	
	static fromJSON(json) {
		let vertex = super.fromJSON(json)
		vertex.pool = json.pool
		return vertex
	}
}

Vertex.Fruit.prototype.style = new VertexStyle("red")

////////////////////////////////////////////////////////////////////////////////

Vertex.Max = class extends Vertex.Base {
	update(h) {
		return Math.max(...h.inputs)
	}
}

Vertex.Max.prototype.style = new VertexStyle("white", {symbol: "∨"})

////////////////////////////////////////////////////////////////////////////////

Vertex.Min = class extends Vertex.Base {
	update(h) {
		return Math.min(...h.inputs)
	}
}

Vertex.Min.prototype.style = new VertexStyle("white", {symbol: "∧"})

////////////////////////////////////////////////////////////////////////////////

Vertex.Negate = class extends Vertex.Base {
	update(h) {
		return -Math.max(...h.inputs)
 	}
}

Vertex.Negate.prototype.style = new VertexStyle("white", {symbol: "–"})

////////////////////////////////////////////////////////////////////////////////

Vertex.Meter = class extends Vertex.Base {
	constructor() {
		super()
		this.style = new VertexStyle("gray", {
		    symbol: "0",
        	gradient: VertexStyle.RADIAL_GRADIENT
    	})
	}

	format(value) {
		switch(value) {
			case Infinity: return "∞";
			case -Infinity: return "-∞";
			default: return parseFloat(value.toFixed(1)).toString();
		}
	}

	update(h) {
		let energy = h.inputs.reduce((acc, val) => acc + val, 0)
		let val = this.format(energy)
		
		if(val !== this.style.symbol) {
		    h.needsUpdate = true
		    this.style.symbol = val
		    
		    if(energy > 0) {
			    this.style.color = "cyan"
		    }
		    else if(energy < 0) {
			    this.style.color = "red"
		    }
		    else {
			    this.style.color = "gray"
		    }
		}
		
		return energy
	}
}

Vertex.Meter.prototype.style = new VertexStyle("white", {symbol: "F"})

////////////////////////////////////////////////////////////////////////////////

/// Rotates an edge-connected component

/// The rotator works by taking the sum of all the energy received and
/// distributing it across its edge neighbors based on their distance. The
/// linear velocity of all edge neighbors are the same.

/// To make this interesting, let's make this more complicated than it needs to.
/// Here, we're equally distributing the total incoming energy, and distributing
/// it equally between each edge neighbor. We follow the equation of rotational
/// energy, with a moment of inertia equal to that of a rod with unit mass and
/// length equal to the distance between the vertices.

/// Visually:
///     E_rot = 1/2 I w^2
///           = 1/2 (1/3 m_rod l_rod^2) w^2 ; I = 1/3 m_rod l_rod^2
///           = 1/2 (1/3 r^2) (v/r)^2       ; l_rod = r, m_rod = 1, w = v/r
///           = 1/6 v^2
/// Solving for v, this will give us the linear velocity for the vertex.
///     v = sqrt(6 E_rot)

Vertex.Rotator = class extends Vertex.Base {
	update(h) {
	    // total of input values given
	    let e = h.inputs.reduce((acc, val) => acc + val, 0)
		
		for(let neighbor of h.neighbors) {
		    let dir = Math.sign(e)
		    let energy = Math.abs(e) / h.neighbors.length
		    // moment of inertia of rod
		    let v = Math.sqrt(6 * energy)
		    //neighbor.angle = 
		    neighbor.motion
		        .cloneFrom(this.pos)
		        .sub(neighbor.pos)
		        .rotate(1/4 * Math.TAU * dir)
		        .resize(v)
		}
		
		return 0
	}
}

Vertex.Rotator.prototype.style = new VertexStyle("lightgreen", {
	symbol: "⛭",
	gradient: VertexStyle.RADIAL_GRADIENT
})

////////////////////////////////////////////////////////////////////////////////

Vertex.Sensor = class extends Vertex.Base {
    update(h) {
        let min = 240
        for(let v of h.nearby(240)) {
            let distance = v.pos.clone().sub(this.pos).len
            if(distance <= min) {
                min = distance
            }
        }
        return 1 - Math.floor((min - 48) / 192 * 10) / 10
    }
}

Vertex.Sensor.prototype.style = new VertexStyle("rgb(0, 200, 0)", {symbol: "S"})

////////////////////////////////////////////////////////////////////////////////

Vertex.Switch = class extends Vertex.Base {
	constructor() {
		super()
		this.value = 0
		this.style = new VertexStyle("black", {
            textColor: "white",
            symbol: "⭘"
        })
	}

	action() {
	    switch(this.value) {
	        case 0:  this.value =  1; break
	        case 1:  this.value = -1; break
	        case -1: this.value =  0; break
	        default:
	            throw new Error("switch has invalid value: " + this.value)
	    }
	    this.updateStyle()
	}
	
	update(_) {
		return this.value
	}
	
	updateStyle() {
	    switch(this.value) {
	        case 0:
                this.style.color = "black"
	            this.style.symbol = "⭘"
	            break
	        case 1:
                this.style.color = "white"
	            this.style.symbol = '➕'
	            break
	        case -1:
                this.style.color = "white"
	            this.style.symbol = '➖'
	            break
	        default:
	            throw new Error("switch has invalid value: " + this.value)
	    }
	}
	
	toJSON() {
		let obj = super.toJSON()
		delete obj.style
		return obj
	}
	
	static fromJSON(json) {
		let vertex = super.fromJSON(json)
		vertex.value = json.value
		vertex.updateStyle()
		return vertex
	}
}

Vertex.Switch.prototype.style = new VertexStyle("black", {textColor: "white", symbol: "⏼"})

////////////////////////////////////////////////////////////////////////////////
