var Vec2 = {
	length: function( vec ){
		return Math.sqrt( Vec2.lengthSqr( vec ) )
	},

	lengthSqr: function( vec ){
		return vec[0] * vec[0] + vec[1] * vec[1]
	},
	
	isNull: function( vec ){
		return vec[0] == 0 && vec[1] == 0
	},
	
	setComponents: function( vec, x, y ){
		vec[0] = x
		vec[1] = y
		return vec
	},

	normalize: function( vec ){
		if( !Vec2.isNull( vec ) )
			Vec2.scale( vec, 1 / Vec2.length( vec ) )
		return vec
	},

	add: function( vec, vec2 ){
		vec[0] += vec2[0]
		vec[1] += vec2[1]
		return vec
	},

	subtract: function( vec, vec2 ){
		return Vec2.add( vec, Vec2.reverse( vec2 ) )
	},
	
	scale: function( vec, s ){
		vec[0] *= s
		vec[1] *= s
		return vec
	},
	
	resize: function( vec, s ){
		Vec2.normalize( vec )
		Vec2.scale( vec, s )
		return vec
	},
	
	reverse: function( vec ){
		return Vec2.scale( vec, -1 )
	},

	rotate: function( vec, angle ){
		var xOffset = Math.cos( angle )
		var yOffset = Math.sin( angle )
		var xt = vec[0] * xOffset + vec[1] * yOffset
		var yt = vec[1] * xOffset - vec[0] * yOffset
		vec[0] = xt
		vec[1] = yt
		return vec
	},
	
	copy: function( vec, vec2 ){
		vec2[0] = vec[0]
		vec2[1] = vec[1]
		return vec2
	},

	toString: function( vec ){
		return "⟨" + vec[0] + ", " + vec[1] + "⟩"
	}
}
