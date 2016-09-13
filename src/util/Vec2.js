class Vec2 {
	
	static create32(x = 0, y = 0) {
		return new Float32Array([x, y])
	}
	
	static create64(x = 0, y = 0) {
		return new Float64Array([x, y])
	}
	
	static add(a, b, o) {
		o[0] = a[0] + b[0]
		o[1] = a[1] + b[1]
	}
	
	static subtract(a, b, o) {
		o[0] = a[0] - b[0]
		o[1] = a[1] - b[1]
	}
	
	static scale(a, s, o) {
		o[0] = a[0] * s
		o[1] = a[1] * s
	}
	
	static dot(a, b) {
		return a[0] * b[0] + a[1] * b[1]
	}
	
	static resize(a, s, o) {
		let len = Vec2.length(a)
		o[0] = a[0] * s / len
		o[1] = a[1] * s / len
	}

	static normalize(a, o) {
		let len = Vec2.length(a)
		o[0] = a[0] / len
		o[1] = a[1] / len
	}

	static lengthSqr(a) {
		return a[0] * a[0] + a[1] * a[1]
	}
	
	static length(a) {
		return Math.hypot(a[0], a[1])
	}
	
	static reverse(a, o) {
		o[0] = -a[0]
		o[1] = -a[1]
	}

	static rotate(a, t, o) {
		/* BACKUP:
		var temp = Vec2.copy(a)
		var xo = Math.cos(t)
		var yo = Math.sin(t)
		o[0] = temp[0] * xo + temp[1] * yo
		o[1] = temp[1] * xo - temp[0] * yo
		return o
		*/
		var xo = Math.cos(t)
		var yo = Math.sin(t)
		o[0] = a[0] * xo + a[1] * yo
		o[1] = a[1] * xo - a[0] * yo
	}
	
	static equal(a, b) {
		return a[0] == b[0] && a[1] == b[1]
	}
	
	static toString(a) {
		return `<${a[0]}, ${a[1]}>`
	}
}
