//(function main(){
"use strict"

// register vertex types
var Vertices = new RegistryWithDefault("blank")
Vertices.add(0, "blank", Vertex)
Vertices.add(1, "rotator", VertexRotator)
Vertices.add(2, "source", VertexEnergy)
Vertices.add(3, "neuron", VertexNeuron)
Vertices.add(4, "feedback", VertexFeedback)
Vertices.add(5, "switch", VertexSwitch)
Vertices.add(6, "nor", VertexNOR)

var canvas = document.getElementById("c")
var ctx = canvas.getContext("2d")

var load = function(){
	var data = JSON.parse(localStorage["abstractWorldData"])
	world.cam = new Vec2().copy(data.cam)
	
	var vertices = []
	for(var vertObj of data.vertices){
		var vertexClass = Vertices.get(vertObj.type)
		var vertex = new vertexClass(world.graph)
		vertex.pos = new Vec2().copy(vertObj.pos)
		vertex.motion = new Vec2().copy(vertObj.motion)
		vertex.energy = vertObj.energy
		vertices.push(vertex)
		world.graph.add(vertex)
	}
	
	var markedForUpdate = []
	for(var vertObj of data.markedForUpdate)
		markedForUpdate.push(vertices[vertObj])
	
	world.markedForUpdate = new Set(markedForUpdate)
	
	var arcs = []
	for(var arcObj of data.arcs){
		var from = vertices[arcObj.from]
		var to = vertices[arcObj.to]
		var arc = new Arc(from, to)
		arc.weight = arcObj.value.weight
		arc.delay = arcObj.value.delay
		arcs.push(arc)
		world.graph.setArc(from, to, arc)
	}
}

var save = function(){
	localStorage["abstractWorldData"] = JSON.stringify(world, null, "\t")
}

var world = new World

// Load world data, if there is any
if(localStorage["abstractWorldData"])
	load()

var selected = null
var currType = 0
// var input = document.forms.options.elements
// var vectorPool = new ObjectPool(Vec2.create64, 10)

var canvasPosition = null
var prevCanvasPosition = null

var worldPosition = null
var prevWorldPosition = null
var hasDragged = false

var uaHas = function(subs){
	return navigator.userAgent.indexOf(subs) !== -1
}

// If mouse is down and dragged, record position in worldPosition.
// Also handles moving of vertex if one is selected and dragged.
var dragAction = function(evt){
	hasDragged = true
	
	prevCanvasPosition = canvasPosition
	prevWorldPosition = worldPosition
	
	canvasPosition = new Vec2(evt.pageX, evt.pageY)
	worldPosition = canvasPosition.add(world.cam, new Vec2)
	
	if(selected){
		// Helps to differentiate between mouse buttons in different browsers.
		// The reason it works is because the mouseup event for Firefox has the
		// releasing button information in the "buttons" attribute, but Chrome
		// has it on the "button" attribute.
		if(uaHas("Firefox") && evt.buttons == 1 || uaHas("Chrome") && evt.button == 0)
			selected.pos.copy(worldPosition)
	}
	else {
		var canvasMovement = canvasPosition.subtract(prevCanvasPosition, new Vec2)
		canvasMovement.reverse()
		world.cam.add(canvasMovement)
	}
}

var _mouseWheelHandler = function(evt){
	var ticks
	if(evt.type == "DOMMouseScroll")
		ticks = -evt.detail / 3
	else
		ticks = evt.wheelDelta / 120
	
	mouseWheelHandler(ticks)
}

var mouseWheelHandler = function(ticks){
	currType += ticks
	if(currType < 0)
		currType += Vertices.size
	else if(currType >= Vertices.size)
		currType -= Vertices.size
}

// register event handlers
canvas.addEventListener("DOMMouseScroll", _mouseWheelHandler)
canvas.addEventListener("mousewheel",     _mouseWheelHandler)

canvas.addEventListener("mousedown", function(evt){
	canvas.addEventListener("mousemove", dragAction)
	
	canvasPosition = new Vec2(evt.pageX, evt.pageY)
	worldPosition = canvasPosition.add(world.cam, new Vec2)
	
	selected = world.vertexAt(worldPosition)
})

canvas.addEventListener("mouseup", function(evt){
	canvas.removeEventListener("mousemove", dragAction)
	
	// left release
	if(evt.button == 0){
		// remove if there's a vertex and there was no dragging
		if(selected && !hasDragged)
			world.despawn(selected)
	}
	// right release
	else if(evt.button == 2){
		var next = world.vertexAt(worldPosition)
		// a vertex was present on mousedown and on mouseup
		if(selected && next){
			// connect vertices if let go on another (different) vertex
			if(selected !== next){
				console.log("Yep, you're here")
				var arc = new Arc(selected, next)
				world.connect(selected, next, arc)
			}
			// TODO: implement some sort of context menu here
			else if(selected === next){
				selected.action()
			}
		}
		// make new vertex if release in blank area
		else if(!selected && !next){
			var vertex = new (Vertices.getById(currType))(world.graph)
			vertex.pos.copy(worldPosition)
			world.spawn(vertex)
			console.log("Vertex placed at " + worldPosition)
		}
	}
	// reset EVERYTHING
	hasDragged = false
	selected = null
	
	prevCanvasPosition = null
	canvasPosition = null
	prevWorldPosition = null
	worldPosition = null
})

addEventListener("keydown", function(evt){
	// 's' is pressed
	if(evt.keyCode == 83)
		save()
	// 'r' is pressed
	if(evt.keyCode == 82){
		localStorage["abstractWorldData"] = JSON.stringify(new World, null, "\t")
		console.log("World *might* have been reset, not sure. Try hitting the button a few more times, just in case.")
	}
})

addEventListener("keyup", function(evt){
	
})

canvas.addEventListener("contextmenu", function(evt){
	evt.preventDefault()
})

addEventListener("resize", function(evt){
	canvas.width = innerWidth
	canvas.height = innerHeight
})
dispatchEvent(new Event("resize"))


var updateLoop = function(){
	world.tick(selected)
}

var drawLoop = function(){
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.lineWidth = 3
	ctx.lineCap = "square"
	
	// arc drawing procedure
	for(var arc of world.graph.arcs){
		var from = arc.from.pos.clone()
		var to = arc.to.pos.clone()
		
		// To canvas coordinates
		from.subtract(world.cam)
		to.subtract(world.cam)
		
		// get offset from center of vertex to its edge
		var offset = to.subtract(from, new Vec2).resize(world.RAD)
		
		// adjust line start and end positions
		var tail = from.add(offset, new Vec2)
		var head = to.subtract(offset, new Vec2)
		
		// used to calculate positions of both arrowheads
		var angle = 5 * Math.PI / 6
		var arrowHead = head.subtract(tail, new Vec2).resize(3 * world.RAD / 4)
		var tipl = arrowHead.rotate(angle, new Vec2).add(head)
		var tipr = arrowHead.rotate(-angle, new Vec2).add(head)
		
		ctx.beginPath()
		
		ctx.moveTo(tail.x, tail.y)
		ctx.lineTo(head.x, head.y)
		ctx.lineTo(tipl.x, tipl.y)
		ctx.moveTo(head.x, head.y)
		ctx.lineTo(tipr.x, tipr.y)
		ctx.moveTo(head.x, head.y)
		
		ctx.closePath()
		ctx.stroke()
	}
	
	// vertex drawing procedure
	for(var vertex of world.vertices){
		// get position relative to canvas
		var pos1 = vertex.pos.subtract(world.cam, new Vec2)
		ctx.save()
		
		ctx.fillStyle = vertex.color
		ctx.strokeStyle = vertex.border
		
		ctx.beginPath()
		
		ctx.arc(pos1.x, pos1.y, world.RAD, 0, 2 * Math.PI, true)
		
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
		
		if(vertex.icon){
			var pos2 = pos1.clone()
			var offset = new Vec2(1, 1).scale(-Math.SQRT1_2 * world.RAD)
			pos1.add(offset)
			offset.reverse()
			pos2.add(offset)
			ctx.drawImage(vertex.icon, pos1.x, pos1.y, pos2.x, pos2.y)
		}
		else if(vertex.symbol){
			ctx.fillStyle = vertex.textColor
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.font = "16px sans-serif"
			ctx.fillText(vertex.symbol, pos1.x, pos1.y)
		}
		
		ctx.restore()
	}
	
	ctx.save()
	
	var vertexClass = Vertices.getById(currType).prototype
	var pos1 = new Vec2(
		world.RAD + 10,
		innerHeight - world.RAD - 10
	)
	
	ctx.fillStyle = vertexClass.color
	ctx.strokeStyle = vertexClass.border
	
	ctx.beginPath()
	
	ctx.arc(pos1.x, pos1.y, world.RAD, 0, 2 * Math.PI, true)
	
	ctx.closePath()
	ctx.fill()
	ctx.stroke()
	
	if(vertexClass.icon){
		var pos2 = pos1.clone()
		var offset = new Vec2(1, 1).scale(-Math.SQRT1_2 * world.RAD)
		pos1.add(offset)
		offset.reverse()
		pos2.add(offset)
		ctx.drawImage(vertex.icon, pos1.x, pos1.y, pos2.x, pos2.y)
	}
	else if(vertexClass.symbol){
		ctx.fillStyle = vertexClass.textColor
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.font = "16px sans-serif"
		ctx.fillText(vertexClass.symbol, pos1.x, pos1.y)
	}
	
	ctx.restore()
	
	requestAnimationFrame(drawLoop)
}

setInterval(updateLoop, 50/3)
requestAnimationFrame(drawLoop)

//})()