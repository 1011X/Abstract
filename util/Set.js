"use strict"

var Set = Set || (function(){

var Set = function( values ){
	this.values = values || []
}

Set.prototype = {
	
	get size(){
		return this.values.length
	},
	
	values: function(){
		return this.values
	},
	
	keys: Set.prototype.values,
	
	entries: function(){
		var entries = []
		for( var i = 0; i < this.size; ++i ){
			var value = this.values[ i ]
			entries.push( [ value, value ] )
		}
		return entries
	},
	
	has: function( value ){
		return this.values.indexOf( value ) !== -1
	},
	
	add: function( value ){
		if( !this.has( value ) )
			this.values.push( value )
	},
	
	clear: function(){
		this.values.length = 0
	},
	
	delete: function( value ){
		var hadKey = this.has( value )
		if( hadKey )
			for( var i = 0; i < this.size; ++i )
				if( this.values[ i ] === value ){
					this.values.splice( i, 1 )
					break
				}
		return hadKey
	},
	
	forEach: function( callback, thisObj ){
		for( var i = 0; i < this.size; ++i ){
			var value = this.values[ i ]
			callback.call( thisObj, value, value, this )
		}
	}
}

return Set

})()