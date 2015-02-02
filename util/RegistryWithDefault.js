"use strict"

// import "lib/Map.js"

function RegistryWithDefault( name ){
	this.key = name
	this.value = null
	this.idMap = new Map
	this.nameMap = new Map
}

RegistryWithDefault.prototype = {
	
	get size(){
		return this.idMap.size
	},
	
	add: function( id, name, object ){
		if( this.key === name )
			this.value = object
		this.idMap.set( id, object )
		this.nameMap.set( name, object )
	},
	
	get: function( name ){
		var object = this.nameMap.get( name )
		return ( object === undefined ) ? this.value : object
	},
	
	getById: function( id ){
		var object = this.idMap.get( id )
		return ( object === undefined ) ? this.value : object
	}
}