(function(){

var canvas = document.getElementById( "c" )
var context = canvas.getContext( "2d" )

var RAD = 15
var graph = new Graph
var selection = [ null, null ]
var selectedType = 0
var dragPoint = null // used only when creating edges
var dragged = false
var stopTime = false
var arcMode = false

var resize = function( e ){
	canvas.width = innerWidth
	canvas.height = innerHeight
}

var contains = function( string, subs ){
	return string.indexOf( subs ) != -1
}

var dragAction = function( e ){
	// hmm... mixes world and global scopes...
	dragged = true
	dragPoint = [ e.pageX, e.pageY ]
	
	if( selection[0] != null )
		// UGH, browser-specific code
		if( contains( navigator.userAgent, "Firefox" ) && e.buttons == 1
			|| contains( navigator.userAgent, "Chrome" ) && e.button == 0
		){
			selection[0].posX = e.pageX
			selection[0].posY = e.pageY
		}
}

var mouseWheelHandler = function( e ){
	var ticks
	
	if( e.type == "DOMMouseScroll" )
		ticks = -e.detail / 3
	
	else
		ticks = e.wheelDelta / 120
		
	selectedType += ticks
	
	if( selectedType < 0 )
		selectedType += nodeTypes.length - 1
	
	selectedType %= nodeTypes.length - 1
}

var vertexAtPoint = function( x, y ){
	// possible world function
	for( var i = 0, vertex; vertex = graph.vertices[ i ]; ++i ){
	
		var v = [
			vertex.posX - x,
			vertex.posY - y
		]
		
		if( Vec2.lengthSqr( v ) <= RAD * RAD )
			return vertex
	}
	
	return null
}

var getEdgeNeighbors = function( vertex ){
	var neighbors = []
	
	for( var i = 0, edge; edge = graph.edges[ i ]; ++i ){
	
		if( edge[0] === vertex )
			neighbors.push( edge[1] )
		
		else if( edge[1] === vertex )
			neighbors.push( edge[0] )
	}
	
	return neighbors
}

var getArcNeighbors = function( vertex ){
	var neighbors = []
	
	for( var i = 0, arc; arc = graph.arcs[ i ]; ++i )
		if( arc[0] === vertex )
			neighbors.push( arc[1] )
	
	return neighbors
}

var getNeighbors = function( vertex ){
	return [
		getEdgeNeighbors( vertex ),
		getArcNeighbors( vertex )
	]
}

resize()

var nodeTypes = [
	// Blank, matter node
	{
		color: "white",
		update: function( vertex ){},
	},
	// Rotator nodes
	{
		color: "lightgreen",
		update: function( vertex ){
			if( vertex.energy <= 0 )
				return
		
			var neighbors = getEdgeNeighbors( vertex )
			
			for( var i = 0, neighbor; neighbor = neighbors[ i ]; ++i ){
			
				if( neighbor === selection[0] )
					continue
				
				// update() is called 30 times per second, so
				// 2*pi / 30 = pi / 15
				var displace = Vec2.rotate( [
					neighbor.posX - vertex.posX,
					neighbor.posY - vertex.posY
				], Math.PI/15 * vertex.energy )
				
				neighbor.posX = vertex.posX + displace[0]
				neighbor.posY = vertex.posY + displace[1]
			}
			
			vertex.energy = 0
		},
	},
	// Gravity node
	{
		color: "#BE57FF",
		update: function( vertex ){
		
			for( var j = 0, vertex2; vertex2 = graph.vertices[ j ]; ++j )
			
				if( ( vertex2.type == 0 || vertex2.type == 1 )
					&& vertex2 !== selection[0]
				){
				
					var normal = Vec2.normalize( [
						vertex.posX - vertex2.posX,
						vertex.posY - vertex2.posY
					] )
					
					// var force = G / ( length * length )
					
					vertex2.motionX += normal[0]
					vertex2.motionY += normal[1]
					vertex2.posX += vertex2.motionX
					vertex2.posY += vertex2.motionY
				}
		},
	},
	// Positive particle; proton
	{
		color: "red",
		update: function( vertex ){
		
			for( var j = 0, vertex2; vertex2 = graph.vertices[ j ]; ++j )
			
				if( vertex2 !== vertex && vertex2 !== selection[0]
					&& ( vertex2.type == 3 || vertex2.type == 4 )
				){
					var normal = Vec2.normalize( [
						vertex.posX - vertex2.posX,
						vertex.posY - vertex2.posY
					] )
					
					if( vertex2.type == 4 ){
					
						vertex2.motionX += normal[0]
						vertex2.motionY += normal[1]
						
					} else if( vertex2.type == 3 ){
					
						vertex2.motionX -= normal[0]
						vertex2.motionY -= normal[1]
						
					}
					vertex2.posX += vertex2.motionX
					vertex2.posY += vertex2.motionY
				}
		},
	},
	// Negative particle; electron
	{
		color: "skyblue",
		update: function( vertex ){
		
			for( var j = 0, vertex2; vertex2 = graph.vertices[ j ]; ++j )
			
				if( vertex2 !== vertex && vertex2 !== selection[0]
					&& ( vertex2.type == 3 || vertex2.type == 4 )
				){
					var normal = Vec2.normalize( [
						vertex.posX - vertex2.posX,
						vertex.posY - vertex2.posY
					] )
					
					if( vertex2.type == 3 ){
					
						vertex2.motionX += normal[0]
						vertex2.motionY += normal[1]
						
					} else if( vertex2.type == 4 ){
					
						vertex2.motionX -= normal[0]
						vertex2.motionY -= normal[1]
					
					}
					vertex2.posX += vertex2.motionX
					vertex2.posY += vertex2.motionY
				}
		},
	},
	
	/*
		TODO: find a way to unite the update code between positive and negative
		nodes. Right now, literally all you have to do to get from one update
		code to the other is copy-paste it and change 2 numbers.
	*/
	
	// Energy supplier
	{
		color: "yellow",
		update: function( vertex ){
			var neighbors = getArcNeighbors( vertex )
			
			for( var i = 0, neighbor; neighbor = neighbors[ i ]; ++i ){
			
				if( neighbor == selection[0] )
					continue
				
				neighbor.energy += 1 / neighbors.length
			}
		},
	},
	// Broken node
	{
		color: "purple",
		update: function( vertex ){},
	},
]


addEventListener( "DOMMouseScroll", mouseWheelHandler )

addEventListener( "mousewheel", mouseWheelHandler )

addEventListener( "mousedown", function( e ){

	addEventListener( "mousemove", dragAction )
	selection[0] = vertexAtPoint( e.pageX, e.pageY )

})
addEventListener( "mouseup", function( e ){
	removeEventListener( "mousemove", dragAction )
	
	var x = e.pageX
	var y = e.pageY
	
	selection[1] = vertexAtPoint( x, y )
	
	if( e.button == 0 ){
	
		if( selection[0] != null && !dragged )
			graph.removeVertex( selection[0] )
			
	} else if( e.button == 2 ){
	
		if( selection[0] != null && selection[1] != null ){
		
			if( arcMode )
				graph.addArc( selection )
				
			else
				graph.addEdge( selection )
				
		} else if( selection[0] == null && selection[1] == null )
		
			graph.addVertex( new Vertex( x, y, selectedType ) )
	}
	
	// reset EVERYTHING
	dragged = false
	selection = [ null, null ]
	dragPoint = null
})

addEventListener( "keydown", function( e ){

	if( e.keyCode == 17 )
		stopTime = true
	
	else if( e.keyCode == 16 )
		arcMode = !arcMode
})

addEventListener( "keyup", function( e ){
	if( e.keyCode == 17 )
		stopTime = false
})

addEventListener( "contextmenu", function( e ){
	e.preventDefault()
})

addEventListener( "resize", resize )


var updateLoop = function(){

	if( stopTime )
		return
	
	for( var i = 0, vertex; vertex = graph.vertices[ i ]; ++i )
		nodeTypes[ vertex.type ].update( vertex )
}

var _drawLine = function( x1, y1, x2, y2 ){
	context.moveTo( x1, y1 )
	context.lineTo( x2, y2 )
	context.moveTo( x1, y1 )
}

var _drawHead = function( x1, y1, x2, y2, attached ){

	// AH = arrow head
	var AHLength = RAD / 2
	
	var baseAH = Vec2.resize( [
		x1 - x2,
		y1 - y2
	], AHLength )
	
	var arrowTipX = x2
	var arrowTipY = y2
		
	if( attached ){
		arrowTipX += baseAH[0] * 2
		arrowTipY += baseAH[1] * 2
	}
	
	context.moveTo( arrowTipX, arrowTipY )
	
	
	var offset = Math.SQRT1_2
	
	var bx = baseAH[0] * offset + baseAH[1] * offset
	var by = baseAH[1] * offset - baseAH[0] * offset
	
	context.lineTo( arrowTipX + bx, arrowTipY + by )
	context.moveTo( arrowTipX, arrowTipY )

	// Because math.
	context.lineTo( arrowTipX - by, arrowTipY + bx )
	
	// Ensures that arrow heads are even/the same length.
	context.moveTo( arrowTipX, arrowTipY )
}

var drawLoop = function(){
	context.clearRect( 0, 0, canvas.width, canvas.height )
	context.lineWidth = 2
	context.lineCap = "square"
	
	if( selection[0] != null && dragPoint != null ){
	
		context.beginPath()
		
		_drawLine( selection[0].posX, selection[0].posY, dragPoint[0], dragPoint[1] )
		
		if( arcMode )
			_drawHead( selection[0].posX, selection[0].posY, dragPoint[0], dragPoint[1], false )
		
		context.closePath()
		context.stroke()
	}
	
	for( var i = 0, edge; edge = graph.edges[ i ]; ++i ){
	
		context.beginPath()
		
		_drawLine( edge[0].posX, edge[0].posY, edge[1].posX, edge[1].posY )
		
		context.closePath()
		
		context.stroke()
	}
	for( var i = 0, arc; arc = graph.arcs[ i ]; ++i ){
	
		context.beginPath()
		
		_drawLine( arc[0].posX, arc[0].posY, arc[1].posX, arc[1].posY )
		_drawHead( arc[0].posX, arc[0].posY, arc[1].posX, arc[1].posY, true )
		
		context.closePath()
		
		context.stroke()
	}
	for( var i = 0, vertex; vertex = graph.vertices[ i ]; ++i ){
	
		context.fillStyle = nodeTypes[ vertex.type ].color
		
		context.beginPath()
		
		context.arc( vertex.posX, vertex.posY, RAD, 0, 2*Math.PI )
		
		context.closePath()
		
		context.fill()
		context.stroke()
	}
	
	// Draw current vertex type on bottom-left of screen
	context.fillStyle = nodeTypes[ selectedType ].color
	
	context.beginPath()
	
	context.arc( RAD + 10, innerHeight - RAD - 10, RAD, 0, 2*Math.PI )
	
	context.closePath()
	
	context.fill()
	context.stroke()
	
	// Draw whether current selection is arc or edge
	context.beginPath()
	
	_drawLine( 2*RAD + 20, innerHeight - 10, 4*RAD + 20, innerHeight - 10 - 2*RAD )
	if( arcMode )
		_drawHead( 2*RAD + 20, innerHeight - 10, 4*RAD + 20, innerHeight - 10 - 2*RAD )
	
	context.closePath()
	
	context.stroke()
	
	requestAnimationFrame( drawLoop )
}

setInterval( updateLoop, 100/3 )
requestAnimationFrame( drawLoop )

})()
