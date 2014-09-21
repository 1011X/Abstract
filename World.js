// import "util/Vec2.js"

function World(){
	this.RAD = 16
	this.vertices = []
	this.graph = new Graph.Mixed( this.vertices )
	this.cam = Vec2.create64()
}

World.prototype = {
	
	vertexAtPoint: function( x, y ){
		// search backwards because last node is drawn on top
		for( var i = this.graph.order - 1; i >= 0; --i ){
			var vertex = this.vertices[ i ]
			var distance = Vec2.create64()
			Vec2.subtract( vertex.pos, [ x, y ], distance )
			if( Vec2.lengthSqr( distance ) <= 1 )
				return vertex
		}
		return null
	},
	
	spawn: function( vertex ){
		this.graph.add( vertex )
	},
	
	despawn: function( vertex ){
		this.graph.delete( vertex )
	},
	
	connect: function( u, v, value, byArc ){
		if( byArc )
			this.graph.connectArc( u, v, value )
		else
			this.graph.connectEdge( u, v, value )
	},
	
	moveCameraTo: function( x, y ){
		this.camX = x
		this.camY = y
	},
	
	broadcast: function( vertex, value ){
		var neighbors = this.graph.neighbors( vertex )
		
		for( var i = 0, neighbor; neighbor = this.graph.neighbors[ i ]; ++i ){
			var weight = this.graph.getArcValue( vertex, neighbor, "weight" )
			weight = weight !== undefined ? weight : 1
			neighbor.changeValue( value * weight )
			neighbor.markNeedsUpdate()
		}
	},
	
	tick: function(){
		for( var i = 0; i < this.graph.order; ++i ){
			var vertex = this.vertices[ i ]
			if( vertex.needsUpdate )
				vertex.update()
		}
	}
}