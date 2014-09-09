var Vec2 = function( x, y ){
	this[0] = x || 0
	this[1] = y || 0
}

Vec2.prototype = {
	
	get x(){
		return this[0]
	},
	
	get y(){
		return this[1]
	},
	
	set x( val ){
		this[0] = val
	},
	
	set y( val ){
		this[1] = val
	},
	
	get length(){
		return Math.sqrt( this.lengthSqr )
	},

	get lengthSqr(){
		return this.x * this.x + this.y * this.y
	},
	
	get isNull(){
		return this.x == 0 && this.y == 0
	},
	
	setComponents: function( x, y ){
		this.x = x
		this.y = y
		return this
	},

	normalize: function(){
		if( !this.isNull )
			this.scale( 1 / this.length )
		return this
	},

	add: function( vec ){
		this.x += vec.x
		this.y += vec.y
		return this
	},

	subtract: function( vec ){
		this.x -= vec.x
		this.y -= vec.y
		return this
	},
	
	scale: function( s ){
		this.x *= s
		this.y *= s
		return this
	},
	
	resize: function( s ){
		this.normalize()
		this.scale( s )
		return this
	},
	
	reverse: function(){
		return this.scale( -1 )
	},

	rotate: function( modAngle ){
		/*
		var modAngle = angle % (2 * Math.PI)
		if( modAngle < 0 )
			modAngle += 2 * Math.PI
		
		if( modAngle == 0 )
			return this
		else if( modAngle == Math.PI )
			return this.reverse()
		else if( modAngle == Math.PI / 2 )
			return this.setComponents( -this.y, this.x )
		else if( modAngle == 3 * Math.PI / 2 )
			return this.setComponents( this.y, -this.x )
		else {*/
			var xOffset = Math.cos( modAngle )
			var yOffset = Math.sin( modAngle )
			var xt = this.x * xOffset + this.y * yOffset
			var yt = this.y * xOffset - this.x * yOffset
			this.x = xt
			this.y = yt
			return this
		//}
	},

	toString: function(){
		return "⟨" + this.x + ", " + this.y + "⟩"
	}
}
