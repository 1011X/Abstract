"use strict"

var Vec2 = {
	
	create32: function(x, y){
		return new Float32Array([x || 0, y || 0])
	},
	
	create64: function(x, y){
		return new Float64Array([x || 0, y || 0])
	},
	
	add: function(a, b, o){
		var r = o || []
		r[0] = a[0] + b[0]
		r[1] = a[1] + b[1]
		return r
	},
	
	subtract: function(a, b, o){
		
		var r = o || []
		r[0] = a[0] - b[0]
		r[1] = a[1] - b[1]
		return r
	},
	
	scale: function(a, s, o){
		var r = o || []
		r[0] = a[0] * s
		r[1] = a[1] * s
		return r
	},
	
	dot: function(a, b){
		return a[0] * b[0] + a[1] * b[1]
	},
	
	resize: function(a, s, o){
		var r = o || []
		Vec2.scale(a, s / Vec2.length(a), r)
		return r
	},

	normalize: function(a, o){
		var r = o || []
		Vec2.resize(a, 1, r)
		return r
	},

	lengthSqr: function(a){
		return Vec2.dot(a, a)
	},
	
	length: function(a){
		return Math.sqrt(Vec2.lengthSqr(a))
	},
	
	reverse: function(a, o){
		var r = o || []
		Vec2.scale(a, -1, r)
		return r
	},

	rotate: function(a, t, o){
		var r = o || []
		var temp = [a[0], a[1]]
		var xo = Math.cos(t)
		var yo = Math.sin(t)
		r[0] = temp[0] * xo + temp[1] * yo
		r[1] = temp[1] * xo - temp[0] * yo
		return r
	},
	
	equal: function(a, b){
		return a[0] == b[0] && a[1] == b[1]
	},

	toString: function(a){
		return "<" + a[0] + ", " + a[1] + ">"
	}
}