"use strict"

function Vec2(x, y){
	if(Array.isArray(x)){
		this.x = x[0] || 0
		this.y = x[1] || 0
	}
	else {
		this.x = x || 0
		this.y = y || 0
	}
}

Vec2.prototype = {
	
	add: function(vector, output){
		var result = output || this
		result.x = this.x + vector.x
		result.y = this.y + vector.y
		return result
	},
	
	subtract: function(vector, output){
		var result = output || this
		result.x = this.x - vector.x
		result.y = this.y - vector.y
		return result
	},
	
	scale: function(size, output){
		var result = output || this
		result.x = this.x * size
		result.y = this.y * size
		return result
	},
	
	dot: function(vector){
		return this.x * vector.x + this.y * vector.y
	},
	
	resize: function(size, output){
		var result = output || this
		return this.scale(size / this.length, result)
	},

	normalize: function(output){
		var result = output || this
		return this.resize(1, result)
	},

	get lengthSqr(){
		return this.dot(this)
	},
	
	get length(){
		return Math.sqrt(this.lengthSqr)
	},
	
	reverse: function(output){
		var result = output || this
		return this.scale(-1, result)
	},
	
	clone: function(){
		return new Vec2(this.x, this.y)
	},

	rotate: function(angle, output){
		var result = output || this
		var temp = this.clone()
		var xOffset = Math.cos(angle)
		var yOffset = Math.sin(angle)
		result.x = temp.x * xOffset + temp.y * yOffset
		result.y = temp.y * xOffset - temp.x * yOffset
		return result
	},
	
	equal: function(vector){
		return this.x === vector.x && this.y === vector.y
	},
	
	copy: function(source){
		this.x = source.x
		this.y = source.y
		return this
	},

	toString: function(){
		return "<" + this.x + ", " + this.y + ">"
	},
	
	toJSON: function(){
		return [this.x, this.y]
	}
}