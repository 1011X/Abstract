class Vec2 extends Float64Array {
	constructor(x, y) {
		super([x, y])
	}
	
	get x() { return this[0] }
	get y() { return this[1] }
	
	set x(val) { this[0] = val }
	set y(val) { this[1] = val }
	
	isNull() {
		return this.eq(Vec2.NULL)
	}
	
	// rhs: Vec2
	add(rhs) {
	    console.assert(rhs instanceof Vec2)
		this.x += rhs.x
		this.y += rhs.y
		return this
	}
	
	// rhs: Vec2
	sub(rhs) {
	    console.assert(rhs instanceof Vec2)
		this.x -= rhs.x
		this.y -= rhs.y
		return this
	}
	
	// scalar: Number
	scale(scalar) {
		this.x *= scalar
		this.y *= scalar
		return this
	}
	
	// s: Number
	resize(s) {
		return this.scale(s / this.len)
	}

	norm() {
		return this.resize(1)
	}

	get lensqr() {
		return this.x * this.x + this.y * this.y
	}
	
	get len() {
		return Math.sqrt(this.lensqr)
	}
	
	reverse() {
		this.x = -this.x
		this.y = -this.y
		return this
	}
    
    /// Rotates clockwise
    // t: Number (radians)
	rotate(t) {
		let xo = Math.cos(t)
		let yo = Math.sin(t)
		let x = this.x * xo + this.y * yo
		let y = this.y * xo - this.x * yo
		this.x = x
		this.y = y
		return this
	}
	
	// other: Vec2
	eq(other) {
	    console.assert(other instanceof Vec2)
		return this.x == other.x && this.y == other.y
	}
	
	clone() {
		return new Vec2(...this)
	}
	
	// source: Vec2
	cloneFrom(source) {
	    console.assert(source instanceof Vec2)
		this.x = source.x
		this.y = source.y
		return this
	}
	
	toJSON() {
		return [this.x, this.y]
	}
	
	toString() {
		return `[${this.x}, ${this.y}]`
	}
	
	// a: Vec2, b: Vec2
	static dot(a, b) {
	    console.assert(a instanceof Vec2)
	    console.assert(b instanceof Vec2)
		return a.x * b.x + a.y * b.y
	}
	
	// a: Vec2, b: Vec2
	static cross(a, b) {
	    console.assert(a instanceof Vec2)
	    console.assert(b instanceof Vec2)
		return a.x * b.y - a.y * b.x
	}
	
	// a: Vec2, b: Vec2
	static eq(a, b) {
	    console.assert(a instanceof Vec2)
	    console.assert(b instanceof Vec2)
		return a.x == b.x && a.y == b.y
	}
}

Object.defineProperty(Vec2, "NULL", {value: new Vec2(0, 0)})
