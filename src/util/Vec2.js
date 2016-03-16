"use strict"

let Vec2 = {
	add(a, b, o = new Array(2)) {
		o[0] = a[0] + b[0]
		o[1] = a[1] + b[1]
		return o
	}
	
	subtract(a, b, o = new Array(2)) {
		o[0] = a[0] - b[0]
		o[1] = a[1] - b[1]
		return o
	}
	
	scale(a, s, o = new Array(2)) {
		o[0] = a[0] * s
		o[1] = a[1] * s
		return o
	}
	
	dot(a, b) {
		return a[0] * b[0] + a[1] * b[1]
	}
	
	resize(a, s, o = new Array(2)) {
		Vec2.scale(a, s / Vec2.length(a), o)
		return o
	}

	normalize(a, o = new Array(2)) {
		Vec2.resize(a, 1, o)
		return o
	}

	lengthSqr(a) {
		return Vec2.dot(a, a)
	}
	
	length(a) {
		return Math.sqrt(Vec2.lengthSqr(a))
	}
	
	reverse(a, o = new Array(2)) {
		Vec2.scale(a, -1, o)
		return o
	}

	rotate(a, t, o = new Array(2)) {
		var temp = Vec2.copy(a)
		var xo = Math.cos(t)
		var yo = Math.sin(t)
		o[0] = temp[0] * xo + temp[1] * yo
		o[1] = temp[1] * xo - temp[0] * yo
		return o
	}
	
	equal(a, b) {
		return a[0] == b[0] && a[1] == b[1]
	}
	
	copy(src, dst = new Array(2)) {
		dst[0] = src[0]
		dst[1] = src[1]
		return dst
	}

	toString(a) {
		return "<" + a[0] + ", " + a[1] + ">"
	}
}
