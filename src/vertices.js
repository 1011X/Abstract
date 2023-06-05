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
	
	draw(ctx) {
		if(this.style.gradient === VertexStyle.RADIAL_GRADIENT) {
			let radialGradient = ctx.createRadialGradient(...this.pos, 0, ...this.pos, this.radius)
		
			radialGradient.addColorStop(0, "white")
			radialGradient.addColorStop(1, this.style.color)

			ctx.fillStyle = radialGradient
		} else {
			ctx.fillStyle = this.style.color
		}

		ctx.beginPath()
			ctx.arc(0, 0, this.radius, 0, Math.TAU)
		ctx.closePath()
		ctx.fill()

		if(this.style.symbol) {
			ctx.fillStyle = this.style.textColor
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.font = "18px sans-serif"
			ctx.fillText(this.style.symbol, 0.5, 2)
		}
	}
}

Vertex.Base.prototype.radius = 24
Vertex.Base.prototype.style = new VertexStyle("black")

////////////////////////////////////////////////////////////////////////////////

Vertex.Anchor = class extends Vertex.Base {
	update(_) {
	    this.motion.scale(0);
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
		// TODO handle what happens if pool goes into negatives
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
///         I = m r^2      (for a point mass)
/// Solving for w gives the angular velocity for the vertex:
///     w = sqrt(2 E_rot / I)
///       = sqrt(2 E_rot / m r^2)

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

Vertex.Switch = class Switch extends Vertex.Base {
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

Vertex.Star = class extends Vertex.Base {
	constructor() {
		super()
		this.sym = Math.floor(3 * Math.random())
		this.style = new VertexStyle("black")
		this.updateStyle()
	}
	
	update(handler) {
		this.style.border = handler.neighbors.length > 0 ? "white" : "black"
	}
	
	updateStyle() {
		if(this.sym === 0)
			this.style.symbol = "🌟"
		else if(this.sym === 1)
			this.style.symbol = "⭐"
		else
			this.style.symbol = "✨"
	}
	
	toJSON() {
		let obj = super.toJSON()
		delete obj.style
		return obj
	}
	
	static fromJSON(json) {
		let vertex = super.fromJSON(json)
		vertex.sym = json.sym
		vertex.updateStyle()
		return vertex
	}
}

//Vertex.Star.prototype.radius = 24
Vertex.Star.prototype.style = new VertexStyle("black", {symbol: "⭐"})

////////////////////////////////////////////////////////////////////////////////

Vertex.Label = class extends Vertex.Base {
	constructor() {
		super();
		this.sym = "_";
		this.style = new VertexStyle('white');
		this.updateStyle();
	}
	
	action() {
		this.sym = window.prompt("label for vertex:") || "_";
		this.updateStyle();
	}
	
	updateStyle() {
		this.style.symbol = this.sym;
	}
	
	toJSON() {
		let obj = super.toJSON();
		delete obj.style;
		return obj;
	}
	
	static fromJSON(json) {
		let vertex = super.fromJSON(json);
		vertex.sym = json.sym;
		vertex.updateStyle();
		return vertex;
	}
}

Vertex.Label.prototype.style = new VertexStyle("white", {symbol: "_"})

////////////////////////////////////////////////////////////////////////////////

/* why am i copying minecraft again?
well, remember that these vertices are saved in json. they each need a number to
know which vertex a save is referring to. dynamically inserting vertices won't
work bc if the number of a vertex changes, then any saves made before the change
will get a different vertex when loaded, and that would be a breaking change.
*/

// FIXME: there's really no need to have a "none" vertex.
// FIXME: also there *has* to be a better way to do this...
Vertex.registry.add( 0, "none",    Vertex.Base)
Vertex.registry.add( 1, "degree",  Vertex.Degree)
Vertex.registry.add( 2, "rotator", Vertex.Rotator)
Vertex.registry.add( 3, "anchor",  Vertex.Anchor)
Vertex.registry.add( 4, "switch",  Vertex.Switch)
Vertex.registry.add( 5, "meter",   Vertex.Meter)
Vertex.registry.add( 6, "min",     Vertex.Min)
Vertex.registry.add( 7, "max",     Vertex.Max)
Vertex.registry.add( 8, "negate",  Vertex.Negate)
Vertex.registry.add( 9, "sensor",  Vertex.Sensor)
Vertex.registry.add(10, "fruit",   Vertex.Fruit)
Vertex.registry.add(11, "star",    Vertex.Star)
Vertex.registry.add(12, "label",   Vertex.Label);
//Vertex.registry.add(12, "neuron",  Neuron)
//Vertex.registry.add(13, "note", Note)
//Vertex.registry.add(14, "charge", Charge)

const VertexMap = {
	'degree': Vertex.Degree,
	'rotate': Vertex.Rotator,
	'anchor': Vertex.Anchor,
	'switch': Vertex.Switch,
	'meter':  Vertex.Meter,
	'min':    Vertex.Min,
	'max':    Vertex.Max,
	'neg':    Vertex.Negate,
	'sensor': Vertex.Sensor,
	'fruit':  Vertex.Fruit,
	'star':   Vertex.Star,
	'label':  Vertex.Label,
}

const VertexIndex = Object.getOwnPropertyNames(VertexMap).sort();

