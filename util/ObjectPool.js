"use strict"

function ObjectPool( creator, amount ){
	this.creator = creator
	this.checkedOut = new Set
	this.pool = []
	
	for( var i = 0; i < amount; ++i )
		this._create()
}

ObjectPool.prototype = {
	
	get size(){
		return this.pool.length
	},
	
	_create: function(){
		var obj = this.creator()
		this.pool.push( obj )
		return obj
	},
	
	request: function(){
		for( var i = 0; i < this.size; ++i ){
			var obj = this.pool[ i ]
			if( !this.checkedOut.has( obj ) ){
				this.checkedOut.add( obj )
				return obj
			}
		}
		return this._create()
	},
	
	return: function( obj ){
		this.checkedOut.delete( obj )
	}
}