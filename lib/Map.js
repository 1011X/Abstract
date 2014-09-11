"use strict"

Map = Map || function( entries ){
	this.entries = entries
}

Map.prototype = Map.prototype || {
	
	get size(){
		return this.entries.length
	},
	
	keys: function(){
		var keys = []
		for( var i = 0; i < this.size; ++i )
			keys.push( this.entries[ i ][0] )
		return keys
	},
	
	values: function(){
		var values = []
		for( var i = 0; i < this.size; ++i )
			values.push( this.entries[ i ][0] )
		return values
	},
	
	entries: function(){
		return this.entries
	},
	
	get: function( key ){
		for( var i = 0; i < this.size; ++i ){
			var entry = this.entries[ i ]
			if( entry[0] === key )
				return entry[1]
		}
	},
	
	has: function( key ){
		return this.keys().indexOf( key ) !== -1
	},
	
	set: function( key, value ){
		if( this.has( key ) )
			for( var i = 0; i < this.size; ++i ){
				var entry = this.entries[ i ]
				if( entry[0] === key ){
					entry[1] = value
					break
				}
			}
		else
			this.entries.push( [ key, value ] )
	},
	
	delete: function( key ){
		var hadKey = this.has( key )
		if( hadKey )
			for( var i = 0; i < this.size; ++i ){
				var entry = this.entries[ i ]
				if( entry[0] === key ){
					this.entries.splice( i, 1 )
					break
				}
			}
		return hadKey
	},
	
	clear: function(){
		this.entries.length = 0
	},
	
	forEach: function( callback, thisObj ){
		for( var i = 0; i < this.size; ++i ){
			var entry = this.entries[ i ]
			callback.call( thisObj, entry[0], entry[1], this )
		}
	}
}