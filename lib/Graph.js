"use strict"

function Map( entries ){
	this.entries = entries
}

Map.prototype = {
	
	get size(){
		return this.entries.length
	},
	
	get keys(){
		var keys = []
		for( var i = 0; i < entries.length; ++i )
			keys.push( entries[ i ][0] )
		return keys
	},
	
	get values(){
		var values = []
		for( var i = 0; i < entries.length; ++i )
			values.push( entries[ i ][0] )
		return values
	},
	
	_getEntryIndex: function( key ){
		return 
	},
	
	get: function( key ){
		for( var i = 0, entry; entry = this.entries[ i ]; ++i )
			if( entry[0] === key )
				return entry[1]
	},
	
	has: function( key ){
		return this.keys.indexOf( key ) !== -1
	},
	
	set: function( key, value ){
		if( this.has( key ) ){
			for( var i = 0, entry; entry = this.entries[ i ]; ++i )
				if( entry[0] === key )
					return void( entry[1] = value )
		} else
			this.entries.push( [ key, value ] )
	},
	
	delete: function( key ){
		var hadKey = this.has( key )
		for( var i = 0, entry; entry = this.entries[ i ]; ++i )
			if( entry[0] === key )
				this.entries.splice( i, 1 )
		return hadKey
	},
	
	clear: function(){
		this.entries.length = 0
	}
}

function Arc( from, to ){
	this.first = from
	this.second = to
}

Arc.prototype = {
	
	has: function( x ){
		return this.first === x || this.second === x
	},
	
	equals: function( x, y ){
		return this.first === x && this.second === y
	}
}


function Edge( a, b ){
	this._a = a
	this._b = b
}

Edge.prototype = {
	
	has: function( x ){
		return this._a === element || this._b === element
	},
	
	equals: function( x, y ){
		return this.has( x ) && this.has( y )
	},
	
	complement: function( x ){
		if( !this.has( x ) )
			throw new Error( "Edge#complement: x isn't in edge." )
		return v === this._a ? this._b : this._a
	}
}


var Graph = {

	_base: function( V ){
		this.vertices = V || []
	},
	
	Directed: function( V ){
		Graph._base.call( this, V )
		this.arcs = []
		this.values = []
	},
	
	Undirected: function( V ){
		Graph._base.call( this, V )
		this.edges = []
		this.values = []
	},
	
	Mixed: function( V ){
		Graph._base.call( this, V )
		this.edges = []
		this.arcs = []
		this.edgeValues = []
		this.arcValues = []
	}
}

Graph._base.prototype = {
	
	get order(){
		return this.vertices.length
	},
	
	indexOf: function( v ){ // private
		return this.vertices.indexOf( v )
	},
	
	has: function( v ){
		return this.indexOf( v ) != -1
	},
	
	add: function( v ){
		if( !this.has( v ) )
			this.vertices.push( v )
	},
	
	remove: function( v ){
		this.vertices.splice( this.indexOf( v ), 1 )
	}
}

Graph.Directed.prototype = Object.create( Graph._base.prototype )

Graph.Undirected.prototype = Object.create( Graph._base.prototype )

Graph.Mixed.prototype = Object.create( Graph._base.prototype )

Graph.Directed.prototype.get = function( u, v ){
	for( var i = 0, arc; arc = this.arcs[ i ]; ++i )
		if( arc.equals( u, v ) )
			return arc
	return null
}

Graph.Directed.prototype.connect = function( u, v, value ){
	if( !this.has( u ) || !this.has( v ) || this.adjacent( u, v ) )
		return
	var arc = new Arc( u, v )
	this.arcs.push( arc )
	this.values.push( [ arc, value ] )
}

Graph.Directed.prototype.neighbors = function( v ){
	var neighbors = []
	for( var i = 0, arc; arc = this.arcs[ i ]; ++i )
		if( arc.first === v )
			neighbors.push( arc.second )
	return neighbors
}

Graph.Directed.prototype.remove = function( v ){
	Graph._base.prototype.remove.call( this, v )
	for( var i = 0, arc; arc = this.arcs[ i ]; ++i )
		if( arc.has( v ) )
			this.arcs.splice( i--, 1 )
}

Graph.Directed.prototype.getValueOf = function( u, v ){
	var arc = this.get( u, v )
	for( var i = 0, entry; entry = this.values[ i ]; ++i )
		if( entry[0] === arc )
			return entry[1]
}

Graph.Directed.prototype.adjacent = function( u, v ){
	return this.get( u, v ) !== null
}

Graph.Directed.prototype.disconnect = function( u, v ){
	for( var i = 0, arc; arc = this.arcs[ i ]; ++i )
		if( arc.equal( u, v ) ){
			this.arcs.splice( i, 1 )
			for( var j = 0, entry; entry = this.values[ j ]; ++j )
				if( entry[0] === arc ){
					this.values.splice( j, 1 )
					return
				}
		}
}


Graph.Undirected.prototype.connect = function( u, v, value ){
	if( !this.has( u ) || !this.has( v ) || this.adjacent( u, v ) )
		return
	var edge = new Edge( u, v )
	this.edges.push( edge )
	this.values.push( [ edge, value ] )
}

Graph.Undirected.prototype.adjacent = function( u, v ){
	if( this.has( v1 ) && this.has( v2 ) )
		for( var i = 0, edge; edge = this.edges[ i ]; ++i )
			if( edge.equal( v1, v2 ) )
				return true
	return false
}

Graph.Undirected.prototype.remove = function( v ){
	for( var i = 0, vertex; vertex = this.vertices[ i ]; ++i )
		if( vertex === v ){
			this.vertices.splice( i, 1 )
			break
		}
	
	for( i = 0, edge; edge = this.edges[ i ]; ++i )
		if( edge.has( v ) )
			this.edges.splice( i--, 1 )
}

Graph.Undirected.prototype.disconnect = function( v1, v2 ){
	for( var i = 0, edge; edge = this.edges[ i ]; ++i )
		if( edge.equal( v1, v2 ) ){
			this.edges.splice( i, 1 )
			break
		}
}

Graph.Undirected.prototype.neighbors = function( v ){
	var neighbors = []
	for( var i = 0, edge; edge = this.edges[ i ]; ++i )
		if( edge.has( v ) )
			neighbors.push( edge.complement( v ) )
	return neighbors
}



Graph.Mixed.prototype.connectByArc = Graph.Directed.prototype.connect

Graph.Mixed.prototype.connectByEdge = Graph.Undirected.prototype.connect

Graph.Mixed.prototype.adjacentByArc = Graph.Directed.prototype.adjacent

Graph.Mixed.prototype.adjacentByEdge = Graph.Undirected.prototype.adjacent

Graph.Mixed.prototype.disconnectByArc = Graph.Directed.prototype.disconnect

Graph.Mixed.prototype.disconnectByEdge = Graph.Undirected.prototype.disconnect

Graph.Mixed.prototype.neighborsByArc = Graph.Directed.prototype.neighbors

Graph.Mixed.prototype.neighborsByEdge = Graph.Undirected.prototype.neighbors

Graph.Mixed.prototype.adjacent = function( v ){
	return this.adjacentByArc( v ) || this.adjacentByEdge
}

Graph.Mixed.prototype.remove = function( v ){
	Graph._base.prototype.remove.call( this, v )
	for( var i = 0, arc; arc = this.arcs[ i ]; ++i )
		if( arc.has( v ) )
			this.arcs.splice( i--, 1 )
	for( var i = 0, edge; edge = this.edges[ i ]; ++i )
		if( edge.has( v ) )
			this.edges.splice( i--, 1 )
}

Graph.Mixed.prototype.getNeighbors = function( v ){
	return [ this.neighborsByEdge( v ), this.neighborsByArc( v ) ]
}

Graph.Mixed.prototype.getConnectionsWithVertices = function( v1, v2 ){
	return [ this.getArcsWithVertices( v1, v2 ), this.getEdgesWithVertices( v1, v2 ) ]
}
