var World = function(){
	this.vertices = []
	this.graph = new Graph( this.vertices )
	this.RAD = 15
	// this.COORDINATE_SCALE = 8
	this.camX = 0
	this.camY = 0
}

World.prototype = {
	
	vertexAtPoint: function( x, y ){
		
		var xPos = x + this.camX
		var yPos = y + this.camY
		
		for( var i = this.graph.order - 1, vertex; vertex = this.graph.vertices[ i ]; --i ){
			// search backwards because last node is always drawn on top
			var d = [ vertex.posX - xPos, vertex.posY - yPos ]
			
			if( d[0] * d[0] + d[1] * d[1] <= this.RAD * this.RAD )
				return vertex
		}
	
		return null
	},
	
	spawnVertex: function( v ){
		this.vertices.push( v )
	},
	
	removeVertex: function( v ){
		this.vertices.splice( this.vertices.indexOf( v ), 1 )
		for( var i = 0, arc; arc = this.graph.arcs[ i ]; ++i )
			if( arc.tail === v || arc.head === v )
				this.graph.disconnect( arc.tail, arc.head )
	},
	
	moveCamera: function( dx, dy ){
		this.camX += dx
		this.camY += dy
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
		for( var i = 0, vertex; vertex = this.graph.vertices[ i ]; ++i )
			if( vertex.needsUpdate )
				vertex.update()
	}
}
