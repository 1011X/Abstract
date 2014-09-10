"use strict"

// import "Map.js"

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
			throw new Error( "Edge#complement: vertex isn't in edge." )
		return v === this._a ? this._b : this._a
	}
}


var Graph = {

	_base: function( V ){
		this.vertices = V || []
	},
	
	Mixed: function( V ){
		Graph._base.call( this, V )
		this.edges = []
		this.arcs = []
		this.edgeValues = new Map
		this.arcValues = new Map
	},
	
	Undirected: function( V ){
		Graph._base.call( this, V )
		this.edges = []
		this.edgeValues = new Map
	},
	
	Directed: function( V ){
		Graph._base.call( this, V )
		this.arcs = []
		this.arcValues = new Map
	}
}

Graph._base.prototype = {
	
	get order(){
		return this.vertices.length
	},
	
	has: function( vertex ){
		return this.vertices.indexOf( vertex ) !== -1
	},
	
	add: function( vertex ){
		if( !this.has( vertex ) )
			this.vertices.push( vertex )
	},
	
	delete: function( vertex ){
		for( var i = 0; i < this.order; ++i )
			if( this.vertices[ i ] === vertex ){
				this.vertices.splice( i, 1 )
				return true
			}
		return false
	}
}

Graph.Mixed.prototype = Object.create( Graph._base.prototype )

Graph.Undirected.prototype = Object.create( Graph._base.prototype )

Graph.Directed.prototype = Object.create( Graph._base.prototype )



Graph.Mixed.prototype.adjacentByEdge = function( u, v ){
	for( var i = 0; i < this.edges.length; ++i ){
		var edge = this.edges[ i ]
		if( edge.equals( u, v ) )
			return true
	}
	return false
}

Graph.Mixed.prototype.adjacentByArc = function( u, v ){
	for( var i = 0; i < this.arcs.length; ++i ){
		var arc = this.arcs[ i ]
		if( arc.equals( u, v ) )
			return true
	}
	return false
}

Graph.Mixed.prototype.adjacent = function( u, v ){
	return this.adjacentByEdge( u, v ) || this.adjacentByArc( u, v )
}

Graph.Mixed.prototype.connectEdge = function( u, v, value ){
	if( this.has( u ) && this.has( v ) && !this.adjacentByEdge( u, v ) ){
		var edge = new Edge( u, v )
		this.edges.push( edge )
		this.edgeValues.set( edge, value )
	}
}

Graph.Mixed.prototype.connectArc = function( u, v, value ){
	if( this.has( u ) && this.has( v ) && !this.adjacentByArc( u, v ) ){
		var arc = new Arc( u, v )
		this.arcs.push( arc )
		this.arcValues.set( arc, value )
	}
}

Graph.Mixed.prototype.getEdgeValue = function( u, v ){
	for( var i = 0; i < this.edges.length; ++i ){
		var edge = this.edges[ i ]
		if( edge.equals( u, v ) )
			return this.edgeValues.get( edge )
	}
}

Graph.Mixed.prototype.getArcValue = function( u, v ){
	for( var i = 0; i < this.arcs.length; ++i ){
		var arc = this.arcs[ i ]
		if( arc.equals( u, v ) )
			return this.arcValues.get( arc )
	}
}

Graph.Mixed.prototype.disconnectEdge = function( u, v ){
	for( var i = 0; i < this.edges.length; ++i ){
		var edge = this.edges[ i ]
		if( edge.equals( u, v ) ){
			this.edges.splice( i, 1 )
			this.edgeValues.delete( edge )
			break
		}
	}
}

Graph.Mixed.prototype.disconnectArc = function( u, v ){
	for( var i = 0; i < this.arcs.length; ++i ){
		var arc = this.arcs[ i ]
		if( arc.equals( u, v ) ){
			this.arcs.splice( i, 1 )
			this.arcValues.delete( arc )
			break
		}
	}
}

Graph.Mixed.prototype.neighborsByEdge = function( vertex ){
	var neighbors = []
	for( var i = 0; i < this.edges.length; ++i ){
		var edge = this.edges[ i ]
		if( edge.has( vertex ) )
			neighbors.push( edge.complement( vertex ) )
	}
	return neighbors
}

Graph.Mixed.prototype.neighborsByArc = function( vertex ){
	var neighbors = []
	for( var i = 0; i < this.arcs.length; ++i ){
		var arc = this.arcs[ i ]
		if( arc.first === vertex )
			neighbors.push( arc.second )
	}
	return neighbors
}

Graph.Mixed.prototype.delete = function( vertex ){
	Graph._base.prototype.delete.call( this, vertex )
	for( var i = 0; i < this.arcs.length; ++i ){
		var arc = this.arcs[ i ]
		if( arc.has( vertex ) )
			this.arcs.splice( i--, 1 )
	}
	for( var i = 0; i < this.edges.length; ++i ){
		var edge = this.edges[ i ]
		if( edge.has( vertex ) )
			this.edges.splice( i--, 1 )
	}
}



Graph.Undirected.prototype.adjacent = Graph.Mixed.prototype.adjacentByEdge

Graph.Undirected.prototype.connect = Graph.Mixed.prototype.connectEdge

Graph.Undirected.prototype.getValue = Graph.Mixed.prototype.getEdgeValue

Graph.Undirected.prototype.disconnect = Graph.Mixed.prototype.disconnectEdge

Graph.Undirected.prototype.neighbors = Graph.Mixed.prototype.neighborsByEdge

Graph.Undirected.prototype.delete = function( vertex ){
	Graph._base.prototype.delete.call( this, vertex )
	for( var i = 0; i < this.edges.length; ++i ){
		var edge = this.edges[ i ]
		if( edge.has( vertex ) )
			this.edges.splice( i--, 1 )
	}
}



Graph.Directed.prototype.adjacent = Graph.Mixed.prototype.adjacentByArc

Graph.Directed.prototype.connect = Graph.Mixed.prototype.connectArc

Graph.Directed.prototype.getValue = Graph.Mixed.prototype.getArcValue

Graph.Directed.prototype.disconnect = Graph.Mixed.prototype.disconnectArc

Graph.Directed.prototype.neighbors = Graph.Mixed.prototype.neighborsByArc

Graph.Directed.prototype.delete = function( vertex ){
	Graph._base.prototype.delete.call( this, vertex )
	for( var i = 0; i < this.arcs.length; ++i ){
		var arc = this.arcs[ i ]
		if( arc.has( vertex ) )
			this.arcs.splice( i--, 1 )
	}
}