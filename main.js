;(function(){

var canvas = document.getElementById( "c" )
var context = canvas.getContext( "2d" )

var RAD = 15
var graph = new Graph.Mixed
var selected = []
var selectedType = 0
var dragPoint = null // used only when creating edges
var dragged = false
var stopTime = false
var arcMode = false

var contains = function( string, subs ){
	return string.indexOf( subs ) != -1
}

var dragAction = function( e ){
	// hmm... mixes world and global scopes...
	dragged = true
	dragPoint = [ e.pageX, e.pageY ]
	
	if( selected[0] )
		// UGH, browser-specific code
		if( contains( navigator.userAgent, "Firefox" ) && e.buttons == 1
			|| contains( navigator.userAgent, "Chrome" ) && e.button == 0
		){
			selected[0].posX = e.pageX
			selected[0].posY = e.pageY
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
	
		var v = [ vertex.posX - x, vertex.posY - y ]
		
		if( v[0] * v[0] + v[1] * v[1] <= RAD * RAD )
			return vertex
	}
	return null
}

var nodeTypes = [
	VertexBlank,
	VertexRotator,
	VertexGravity,
	VertexChargedPositive,
	VertexChargedNegative,
	VertexEnergy,
	VertexForward,
	VertexNeuron,
	Vertex, // Broken node
]


// Event listeners for canvas.

canvas.addEventListener( "DOMMouseScroll", mouseWheelHandler )

canvas.addEventListener( "mousewheel", mouseWheelHandler )

canvas.addEventListener( "mousedown", function( e ){
	canvas.addEventListener( "mousemove", dragAction )
	selected[0] = vertexAtPoint( e.pageX, e.pageY )
})

canvas.addEventListener( "mouseup", function( e ){
	canvas.removeEventListener( "mousemove", dragAction )
	console.log( e )
	
	var x = e.pageX
	var y = e.pageY
	
	selected[1] = vertexAtPoint( x, y )
	
	if( e.button == 0 ){
	
		if( selected[0] && !dragged )
			graph.remove( selected[0] )
			
	} else if( e.button == 2 ){
	
		if( selected[0] && selected[1] ){
		
			if( arcMode )
				graph.connectByArc( selected[0], selected[1], { weight: 1 } )
			else
				graph.connectByEdge( selected[0], selected[1] )
				
		} else if( !selected[0] && !selected[1] ){
			
			var vertex = new nodeTypes[ selectedType ]( graph )
			vertex.setPosition( x, y )
			graph.add( vertex )
			
		}
	}
	
	// reset EVERYTHING
	dragged = false
	selected.length = 0
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

canvas.addEventListener( "contextmenu", function( e ){
	e.preventDefault()
})

canvas.addEventListener( "resize", function( e ){
	canvas.width = innerWidth
	canvas.height = innerHeight
})
var r = new Event( "resize" )
canvas.dispatchEvent( r )


var updateLoop = function(){
	if( stopTime )
		return
	
	for( var i = 0, vertex; vertex = graph.vertices[ i ]; ++i ){
		if( vertex.energy == 0 )
			continue
		vertex.update({
			selected: selected[0] === vertex,
			connections: graph.getConnectionsByArc( vertex ),
		})
	}
}

var _drawLine = function( x1, y1, x2, y2 ){
	context.beginPath()
	context.moveTo( x1, y1 )
	context.lineTo( x2, y2 )
	context.moveTo( x1, y1 )
	context.closePath()
	context.stroke()
}

var _drawHead = function( x1, y1, x2, y2, attached ){
	/* NOTE: Class Vec2 is not used here because object creation would greatly
	 * reduce the speed of the drawing. */
	
	// AH = arrow head
	var AHLength = RAD / 2
	
	var baseAHx = x1 - x2
	var baseAHy = y1 - y2
	/* This "vector" points towards the arrow's tail, to make
	 * drawing the arrowhead easier. */
	
	if( !( baseAHx == 0 && baseAHy == 0 ) ){
		// Resize "vector" to arrowhead length
		var headLength = AHLength / Math.sqrt( baseAHx * baseAHx + baseAHy * baseAHy )
		baseAHx *= headLength
		baseAHy *= headLength
	}
	
	var arrowTipX = x2
	var arrowTipY = y2
		
	if( attached ){
		/* Checks if attached to vertex.
		 * If so, adjust position of where arrow tip is supposed to be. */
		arrowTipX += baseAHx * 2
		arrowTipY += baseAHy * 2
	}
	
	var offset = Math.SQRT1_2
	
	var bx = baseAHx * offset + baseAHy * offset
	var by = baseAHy * offset - baseAHx * offset
	
	context.beginPath()
	context.moveTo( arrowTipX, arrowTipY )
	
	context.lineTo( arrowTipX + bx, arrowTipY + by )
	context.moveTo( arrowTipX, arrowTipY )

	// Because math.
	context.lineTo( arrowTipX - by, arrowTipY + bx )
	
	// Ensures that arrow heads are even/the same length.
	context.moveTo( arrowTipX, arrowTipY )
	context.closePath()
	context.stroke()
}

var drawLoop = function(){
	context.clearRect( 0, 0, canvas.width, canvas.height )
	context.lineWidth = 3
	context.lineCap = "square"
	
	if( selected[0] && dragPoint ){
		context.beginPath()
		_drawLine( selected[0].posX, selected[0].posY, dragPoint[0], dragPoint[1] )
		if( arcMode )
			_drawHead( selected[0].posX, selected[0].posY, dragPoint[0], dragPoint[1], false )
		context.closePath()
		context.stroke()
	}
	
	for( var i = 0, edge; edge = graph.edges[ i ]; ++i ){
		context.save()
		// Do stuff to edge styling
		_drawLine( edge[0].posX, edge[0].posY, edge[1].posX, edge[1].posY )
		context.restore()
	}
	
	for( var i = 0, arc; arc = graph.arcs[ i ]; ++i ){
		context.save()
		// Do stuff to arc styling
		_drawLine( arc[0].posX, arc[0].posY, arc[1].posX, arc[1].posY )
		_drawHead( arc[0].posX, arc[0].posY, arc[1].posX, arc[1].posY, true )
		context.restore()
	}
	
	for( var i = 0, vertex; vertex = graph.vertices[ i ]; ++i ){
		context.save()
		context.fillStyle = vertex.color
		context.strokeStyle = vertex.border
		context.beginPath()
		context.arc( vertex.posX, vertex.posY, RAD, 0, 2*Math.PI )
		context.closePath()
		context.fill()
		context.stroke()
		
		if( vertex.symbol ){
			context.fillStyle = "black"
			context.textAlign = "center"
			context.textBaseline = "middle"
			context.font = "15px sans-serif"
			context.fillText( vertex.symbol, vertex.posX, vertex.posY )
		}
		context.restore()
	}
	
	// HUD Stuff
	// Draw current vertex type on bottom-left of screen
	context.fillStyle = (new nodeTypes[ selectedType ]( graph )).color
	context.beginPath()
	
	context.arc( RAD + 10, innerHeight - RAD - 10, RAD, 0, 2*Math.PI )
	
	context.closePath()
	context.fill()
	context.stroke()
	
	// Draw whether current selection is arc or edge
	
	_drawLine( 2*RAD + 20, innerHeight - 10, 4*RAD + 20, innerHeight - 10 - 2*RAD )
	if( arcMode )
		_drawHead( 2*RAD + 20, innerHeight - 10, 4*RAD + 20, innerHeight - 10 - 2*RAD, false )
	
	requestAnimationFrame( drawLoop )
}

setInterval( updateLoop, 100/3 )
requestAnimationFrame( drawLoop )

})()
