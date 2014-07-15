"use strict"

function Graph( V, E, A ){
	this.vertices = V || []
	/* MEMO:
		Edges will not stretch indefinitely.
		Arcs can stretch indefinitely, and serve as a medium for energy.
	*/
	this.edges = E || []
	this.arcs = A || []
}

Graph.prototype = {
	get order(){
		return this.vertices.length
	},
	
	addVertex: function( vertex ){
		this.vertices.push( vertex )
	},
	
	addEdge: function( edge ){
		this.edges.push( edge )
	},
	
	addArc: function( arc ){
		this.arcs.push( arc )
	},
	
	removeVertex: function( vertex ){
		for( var i = 0; i < this.order; ++i )
			if( this.vertices[ i ] === vertex ){
				this.vertices.splice( i, 1 )
				break
			}

		for( i = 0; i < this.edges.length; ++i )
			if( this.edges[ i ][0] === vertex || this.edges[ i ][1] === vertex ){
				this.edges.splice( i, 1 )
				i--
			}
	
		for( i = 0; i < this.arcs.length; ++i )
			if( this.arcs[ i ][0] === vertex || this.arcs[ i ][1] === vertex ){
				this.arcs.splice( i, 1 )
				i--
			}
	
	},
	
	removeEdge: function( edge ){
		for( var i = 0; i < this.edges.length; ++i )
			if( this.edges[ i ] === edge ){
				this.edges.splice( i, 1 )
				return
			}
	},
	
	removeArc: function( arc ){
		for( var i = 0; i < this.arcs.length; ++i )
			if( this.arcs[ i ] === arc ){
				this.arcs.splice( i, 1 )
				return
			}
	}
	
}
