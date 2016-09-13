class Vec2 extends Float64Array {
	constructor(x = 0, y = 0) {
		super([x, y])
	}
	
	get x() { return this[0] }
	get y() { return this[1] }
	
	set x(val) { this[0] = val }
	set y(val) { this[1] = val }
	
	add(a) {
		this[0] += a[0]
		this[1] += a[1]
		return this
	}
	
	subtract(a) {
		this[0] -= a[0]
		this[1] -= a[1]
		return this
	}
	
	scale(s) {
		this[0] *= s
		this[1] *= s
		return this
	}
	
	resize(s) {
		let len = a.length
		this[0] *= s / len
		this[1] *= s / len
		return this
	}

	normalize() {
		let len = a.length
		this[0] /= len
		this[1] /= len
		return this
	}

	get lengthSqr() {
		return this[0] * this[0] + this[1] * this[1]
	}
	
	get length() {
		return Math.hypot(...this)
	}
	
	reverse() {
		this[0] *= -1
		this[1] *= -1
		return this
	}

	rotate(t) {
		/* BACKUP:
		var temp = Vec2.copy(a)
		var xo = Math.cos(t)
		var yo = Math.sin(t)
		o[0] = temp[0] * xo + temp[1] * yo
		o[1] = temp[1] * xo - temp[0] * yo
		return o
		*/
		let temp = [0, 0]
		let xo = Math.cos(t)
		let yo = Math.sin(t)
		temp[0] = this[0] * xo + this[1] * yo
		temp[1] = this[1] * xo - this[0] * yo
		this[0] = temp[0]
		this[1] = temp[1]
		return this
	}
	
	eq(b) {
		return this[0] == b[0] && this[1] == b[1]
	}
	
	clone() {
		return new Vec2(...this)
	}
	
	toString() {
		return `<${this[0]}, ${this[1]}>`
	}
	
	static dot(a, b) {
		return a[0] * b[0] + a[1] * b[1]
	}
	
	static eq(a, b) {
		return a[0] == b[0] && a[1] == b[1]
	}
}
