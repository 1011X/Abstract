(function(){

var canvas = document.getElementById( "c" )
var context = canvas.getContext( "2d" )

var world = new World
var selected = []
var input = document.forms.options
var vectorPool = new ObjectPool( Vec2.create64, 5 )
var selectedType = 1
var dragPoint = null // used only when creating edges
var stopTime = false
var arcMode = false

var uaHas = function( subs ){
	return navigator.userAgent.indexOf( subs ) !== -1
}

var dragAction = function( e ){
	var pos = [ e.pageX, e.pageY ]
	if( dragPoint ){
		dragPoint[0] = pos[0]
		dragPoint[1] = pos[1]
	} else 
		dragPoint = Vec2.create32( pos[0], pos[1] )
	
	if( selected[0] )
		// Helps to differentiate between mouse buttons in different
		// browsers... somehow.
		if( uaHas( "Firefox" ) && e.buttons == 1 || uaHas( "Chrome" ) && e.button == 0 )
			canvasToWorld( pos, selected[0].pos )
}

var mouseWheelHandler = function( e ){
	var ticks
	if( e.type == "DOMMouseScroll" )
		ticks = -e.detail / 3
	else
		ticks = e.wheelDelta / 120
}

var canvasToWorld = function( pos, out ){
	out[0] = pos[0]
	out[1] = -pos[1]
	Vec2.add( out, world.cam, out )
	Vec2.scale( out, 1 / world.RAD, out )
}

var worldToCanvas = function( pos, out ){
	out[0] = pos[0]
	out[1] = -pos[1]
	Vec2.subtract( out, world.cam, out )
	Vec2.scale( out, world.RAD, out )
}

var Vertices = new RegistryWithDefault( "broken" )
Vertices.add( 0, "broken", Vertex )
Vertices.add( 1, "blank", VertexBlank )
Vertices.add( 2, "rotator", VertexRotator )
Vertices.add( 3, "gravitator", VertexGravity )
Vertices.add( 4, "positiveParticle", VertexChargedPositive )
Vertices.add( 5, "negativeParticle", VertexChargedNegative )
Vertices.add( 6, "source", VertexEnergy )
Vertices.add( 7, "extend", VertexExtend )
Vertices.add( 8, "neuron", VertexNeuron )



canvas.addEventListener( "DOMMouseScroll", mouseWheelHandler )

canvas.addEventListener( "mousewheel", mouseWheelHandler )

canvas.addEventListener( "mousedown", function( e ){
	canvas.addEventListener( "mousemove", dragAction )
	
	var pos = [ e.pageX, e.pageY ]
	canvasToWorld( pos, pos )
	
	selected[0] = world.vertexAtPoint( pos[0], pos[1] )
})

canvas.addEventListener( "mouseup", function( e ){
	canvas.removeEventListener( "mousemove", dragAction )
	
	var pos = [ e.pageX, e.pageY ]
	canvasToWorld( pos, pos )
	
	selected[1] = world.vertexAtPoint( pos[0], pos[1] )
	
	if( e.button == 0 ){
	
		if( selected[0] && !dragPoint )
			world.despawn( selected[0] )
			
	} else if( e.button == 2 ){
	
		if( selected[0] && selected[1] ){
		
			if( arcMode )
				world.connect( selected[0], selected[1], { weight: 1 }, true )
			else
				world.connect( selected[0], selected[1], undefined, false )
				
		} else if( !selected[0] && !selected[1] ){
			
			var vertex = new ( Vertices.getByID( selectedType ) )( world.graph )
			vertex.setPosition( pos[0], pos[1] )
			world.spawn( vertex )
			
		}
	}
	// reset EVERYTHING
	selected.length = 0
	dragPoint = null
})

addEventListener( "keydown", function( e ){
	if( e.keyCode == 16 )
		arcMode = !arcMode
})

addEventListener( "keyup", function( e ){
	
})

canvas.addEventListener( "contextmenu", function( e ){
	e.preventDefault()
})

addEventListener( "resize", function( e ){
	canvas.width = innerWidth
	canvas.height = innerHeight
})
var r = new Event( "resize" )
dispatchEvent( r )


var updateLoop = function(){
	for( var i = 0; i < world.graph.order; ++i ){
		var vertex = world.graph.vertices[ i ]
		vertex.update()
	}
}


var drawHead = function( pos1, pos2, attached ){
	
	// AH = arrow head
	var baseAH = vectorPool.request()
	var arrowTip = vectorPool.request()
	var rotatedAH = vectorPool.request()
	
	// Points towards arc's tail to make drawing arrow-head easier.
	Vec2.subtract( pos1, pos2, baseAH )
	
	// Resize vector to arrow-head length
	Vec2.resize( baseAH, 3 * world.RAD / 4, baseAH )
	
	arrowTip[0] = pos2[0]
	arrowTip[1] = pos2[1]
	
	if( attached ){
		var temp = vectorPool.request()
		// If attached to vertex, adjust position of where arrow tip is
		// supposed to be.
		Vec2.resize( baseAH, world.RAD, temp )
		Vec2.add( arrowTip, temp, arrowTip )
		vectorPool.return( temp )
	}
	
	rotatedAH[0] = Math.SQRT1_2 * ( baseAH[0] + baseAH[1] )
	rotatedAH[1] = Math.SQRT1_2 * ( baseAH[1] - baseAH[0] )
	
	vectorPool.return( baseAH )
	
	context.beginPath()
	
	context.moveTo( arrowTip[0], arrowTip[1] )
	
	context.lineTo( arrowTip[0] + rotatedAH[0], arrowTip[1] + rotatedAH[1] )
	context.moveTo( arrowTip[0], arrowTip[1] )
	
	// Because math.
	context.lineTo( arrowTip[0] - rotatedAH[1], arrowTip[1] + rotatedAH[0] )
	
	context.moveTo( 0, 0 )
	
	context.closePath()
	context.stroke()
	
	vectorPool.return( arrowTip )
	vectorPool.return( rotatedAH )
}

var drawLine = function( pos1, pos2, attached ){
	var offset = vectorPool.request()
	var start = vectorPool.request()
	
	// Get offset from center of vertex to its rim.
	Vec2.subtract( pos2, pos1, offset )
	Vec2.resize( offset, world.RAD, offset )
	
	// Adjust line start and edge positions.
	Vec2.add( pos1, offset, start )
	
	context.beginPath()
	
	context.moveTo( start[0], start[1] )
	
	if( attached ){
		var end = vectorPool.request()
		Vec2.subtract( pos2, offset, end )
		context.lineTo( end[0], end[1] )
		vectorPool.return( end )
	} else
		context.lineTo( pos2[0], pos2[1] )
	
	context.moveTo( 0, 0 )
	context.closePath()
	
	context.stroke()
	
	vectorPool.return( offset )
	vectorPool.return( start )
}


var drawLoop = function(){
	context.clearRect( 0, 0, canvas.width, canvas.height )
	context.lineWidth = 3
	context.lineCap = "square"
	
	if( selected[0] && dragPoint ){
		var pos = vectorPool.request()
		worldToCanvas( selected[0].pos, pos )
		context.beginPath()
		drawLine( pos, dragPoint )
		if( arcMode )
			drawHead( pos, dragPoint, false )
		context.closePath()
		context.stroke()
		vectorPool.return( pos )
	}
	
	for( var i = 0; i < world.graph.edges.length; ++i ){
		var edge = world.graph.edges[ i ].values
		var pos1 = vectorPool.request()
		var pos2 = vectorPool.request()
		worldToCanvas( edge[0].pos, pos1 )
		worldToCanvas( edge[1].pos, pos2 )
		context.save()
		drawLine( pos1, pos2 )
		context.restore()
		vectorPool.return( pos1 )
		vectorPool.return( pos2 )
	}
	
	for( var i = 0; i < world.graph.arcs.length; ++i ){
		var arc = world.graph.arcs[ i ].values
		var pos1 = vectorPool.request()
		var pos2 = vectorPool.request()
		worldToCanvas( arc[0].pos, pos1 )
		worldToCanvas( arc[1].pos, pos2 )
		context.save()
		drawLine( pos1, pos2 )
		drawHead( pos1, pos2, true )
		context.restore()
		vectorPool.return( pos1 )
		vectorPool.return( pos2 )
	}
	
	for( var i = 0; i < world.graph.order; ++i ){
		var vertex = world.graph.vertices[ i ]
		var pos = vectorPool.request()
		worldToCanvas( vertex.pos, pos )
		context.save()
		context.fillStyle = vertex.color
		context.strokeStyle = vertex.border
		context.beginPath()
		context.arc( pos[0], pos[1], world.RAD, 0, 2*Math.PI )
		context.closePath()
		context.fill()
		context.stroke()
		if( vertex.text ){
			context.fillStyle = "black"
			context.textAlign = "center"
			context.textBaseline = "middle"
			context.font = "15px sans-serif"
			context.fillText( vertex.text, pos[0], pos[1] )
		}
		context.restore()
		vectorPool.return( pos )
	}
	
	requestAnimationFrame( drawLoop )
}

setInterval( updateLoop, 50/3 )
requestAnimationFrame( drawLoop )

})()