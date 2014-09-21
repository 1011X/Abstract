"use strict"

var Vec2 = {
	
	create32: function( x, y ){
		return new Float32Array( [ x || 0, y || 0 ] )
	},
	
	create64: function( x, y ){
	    return new Float64Array( [ x || 0, y || 0 ] )
	},
	
	add: function( a, b, out ){
	    out[0] = a[0] + b[0]
	    out[1] = a[1] + b[1]
	},
	
	subtract: function( a, b, out ){
	    out[0] = a[0] - b[0]
	    out[1] = a[1] - b[1]
	},
	
	scale: function( a, s, out ){
	    out[0] = a[0] * s
	    out[1] = a[1] * s
	},
	
	dot: function( a, b ){
		return a[0] * b[0] + a[1] * b[1]
	},
	
	resize: function( a, s, out ){
		Vec2.scale( a, s / Vec2.length( a ), out )
	},

	normalize: function( a, out ){
		Vec2.resize( a, 1, out )
	},

	lengthSqr: function( a ){
		return Vec2.dot( a, a )
	},
	
	length: function( a ){
		return Math.sqrt( Vec2.lengthSqr( a ) )
	},
	
	reverse: function( a, out ){
		Vec2.scale( a, -1, out )
	},

	rotate: function( a, angle, out ){
		var xOffset = Math.cos( angle )
		var yOffset = Math.sin( angle )
		out[0] = a[0] * xOffset + a[1] * yOffset
		out[1] = a[1] * xOffset - a[0] * yOffset
	},

	toString: function( a ){
		return "<" + a[0] + ", " + a[1] + ">"
	}
}