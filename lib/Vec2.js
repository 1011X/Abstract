"use strict"

var Vec2 = {
	
	length: function( vec ){
		return Math.sqrt( Vec2.lengthSqr( vec ) )
	},

	lengthSqr: function( vec ){
		return vec[0] * vec[0] + vec[1] * vec[1]
	},
	
	setComponents: function( vec, x, y ){
		vec[0] = x
		vec[1] = y
		return vec
	},

	add: function( vec1, vec2, reuse ){
		var x = vec1[0] + vec2[0]
		var y = vec1[1] + vec2[1]
		return reuse ? Vec2.setComponents( vec1, x, y ) : [ x, y ]
	},

	subtract: function( vec1, vec2, reuse ){
		var x = vec1[0] - vec2[0]
		var y = vec1[1] - vec2[1]
		return reuse ? Vec2.setComponents( vec1, x, y ) : [ x, y ]
	},
	
	scale: function( vec, s, reuse ){
		var x = vec[0] * s
		var y = vec[1] * s
		return reuse ? Vec2.setComponents( vec, x, y ) : [ x, y ]
	},
	
	resize: function( vec, s ){
		return Vec2.scale( vec, s / Vec2.length( vec ), true )
	},

	normal: function( vec ){
		return Vec2.scale( vec, 1 / Vec2.length( vec ), false )
	},
	
	normalize: function( vec ){
		Vec2.scale( vec, 1 / Vec2.length( vec ), true )
	},
	
	reverse: function( vec ){
		return Vec2.scale( vec, -1 )
	},

	rotate: function( vec, angle ){
		var xOffset = Math.cos( angle )
		var yOffset = Math.sin( angle )
		var xt = vec[0] * xOffset + vec[1] * yOffset
		var yt = vec[1] * xOffset - vec[0] * yOffset
		return Vec2.setComponents( vec, xt, yt )
	},
	
	dot: function( vec1, vec2 ){
		return vec1[0] * vec2[0] + vec1[1] * vec2[1]
	},

	toString: function( vec ){
		return "<" + vec[0] + ", " + vec[0] + ">"
	}
}