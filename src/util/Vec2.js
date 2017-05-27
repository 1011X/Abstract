class Vec2 extends Float64Array {
	constructor(x = 0, y = 0) {
		super([x, y])
	}
	
	get x() { return this[0] }
	get y() { return this[1] }
	
	set x(val) { this[0] = val }
	set y(val) { this[1] = val }
	
	isNull() {
		return this.eq(Vec2.NULL)
	}
	
	add(rhs) {
		this.x += rhs[0]
		this.y += rhs[1]
		return this
	}
	
	sub(rhs) {
		this.x -= rhs[0]
		this.y -= rhs[1]
		return this
	}
	
	scale(scalar) {
		this.x *= scalar
		this.y *= scalar
		return this
	}
	
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

	rotate(t) {
		let xo = Math.cos(t)
		let yo = Math.sin(t)
		this.cloneFrom([
			this.x * xo + this.y * yo,
			this.y * xo - this.x * yo
		])
		return this
	}
	
	eq(other) {
		return this.x == other[0] && this.y == other[1]
	}
	
	clone() {
		return new Vec2(...this)
	}
	
	cloneFrom(source) {
		this.x = source[0]
		this.y = source[1]
	}
	
	toJSON() {
		return [this.x, this.y]
	}
	
	toString() {
		return `[${this.x}, ${this.y}]`
	}
	
	static dot(a, b) {
		return a[0] * b[0] + a[1] * b[1]
	}
	
	static eq(a, b) {
		return a[0] == b[0] && a[1] == b[1]
	}
}

Object.defineProperty(Vec2, "NULL", {value: new Vec2})
