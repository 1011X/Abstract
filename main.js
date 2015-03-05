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
	world.cam = data.cam
	
	var vertices = []
	for(var vertObj of data.vertices){
		var vertexClass = Vertices.get(vertObj.type)
		var vertex = new vertexClass(world.graph)
		vertex.pos = vertObj.pos
		vertex.motion = vertObj.motion
		vertex.energy = vertObj.energy
		vertices.push(vertex)
		world.graph.add(vertex)
	}
	
	var markedForUpdates = []
	for(var vertObj of data.markedForUpdates)
		markedForUpdates.push(vertices[vertObj])
	
	world.markedForUpdates = new Set(markedForUpdates)
	
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

// Save every 5 seconds
setInterval(save, 5000)

var selected = null
var currType = 0
// var input = document.forms.options.elements
// var vectorPool = new ObjectPool(Vec2.create64, 10)

/*
	Future me:
	You're gonna want to update everything to do with vectors. Remember you
	changed the Vec2 class?
*/

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
	
	canvasPosition = [evt.pageX, evt.pageY]
	worldPosition = Vec2.add(canvasPosition, world.cam)
	
	if(selected){
		// Helps to differentiate between mouse buttons in different browsers.
		// The reason it works is because the mouseup event for Firefox has the
		// releasing button information in the "buttons" attribute, but Chrome
		// has it on the "button" attribute.
		if(uaHas("Firefox") && evt.buttons == 1 || uaHas("Chrome") && evt.button == 0){
			Vec2.copy(worldPosition, selected.pos)
		}
	}
	else {
		var canvasMovement = Vec2.subtract(canvasPosition, prevCanvasPosition)
		Vec2.reverse(canvasMovement, canvasMovement)
		Vec2.add(world.cam, canvasMovement, world.cam)
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
	// something in here is wrong...
	canvasPosition = [evt.pageX, evt.pageY]
	worldPosition = Vec2.add(canvasPosition, world.cam)
	
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
			vertex.pos = Vec2.copy(worldPosition)
			world.spawn(vertex)
			console.log("Vertex placed at " + Vec2.toString(worldPosition))
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
		console.log("World reset! I think...")
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
		var from = Vec2.copy(arc.from.pos)
		var to = Vec2.copy(arc.to.pos)
		
		// To canvas coordinates
		Vec2.subtract(from, world.cam, from)
		Vec2.subtract(to, world.cam, to)
		
		// get offset from center of vertex to its edge
		var offset = Vec2.resize(Vec2.subtract(to, from), world.RAD)
		
		// adjust line start and end positions
		var tail = Vec2.add(from, offset)
		var head = Vec2.subtract(to, offset)
		
		// used to calculate positions of both arrowheads
		var angle = 5 * Math.PI / 6
		var arrowHead = Vec2.resize(Vec2.subtract(head, tail), 3 * world.RAD / 4)
		var tipl = Vec2.add(head, Vec2.rotate(arrowHead, angle))
		var tipr = Vec2.add(head, Vec2.rotate(arrowHead, -angle))
		
		ctx.beginPath()
		
		ctx.moveTo(tail[0], tail[1])
		ctx.lineTo(head[0], head[1])
		ctx.lineTo(tipl[0], tipl[1])
		ctx.moveTo(head[0], head[1])
		ctx.lineTo(tipr[0], tipr[1])
		ctx.moveTo(head[0], head[1])
		
		ctx.closePath()
		ctx.stroke()
	}
	
	// vertex drawing procedure
	for(var vertex of world.vertices){
		var pos1 = Vec2.subtract(vertex.pos, world.cam)
		ctx.save()
		
		ctx.fillStyle = vertex.color
		ctx.strokeStyle = vertex.border
		
		ctx.beginPath()
		
		ctx.arc(pos1[0], pos1[1], world.RAD, 0, 2 * Math.PI, true)
		
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
		
		if(vertex.icon){
			pos1 = [
				vertex.pos[0] - Math.SQRT1_2 * world.RAD,
				vertex.pos[1] + Math.SQRT1_2 * world.RAD
			]
			Vec2.add(pos1, world.cam, pos1)
			var pos2 = [
				vertex.pos[0] + Math.SQRT1_2 * world.RAD,
				vertex.pos[1] - Math.SQRT1_2 * world.RAD
			]
			Vec2.add(pos2, world.cam, pos2)
			Vec2.subtract(pos2, pos1, pos2)
			ctx.drawImage(vertex.icon, pos1[0], pos1[1], pos2[0], pos2[1])
		}
		else if(vertex.symbol){
			ctx.fillStyle = vertex.textColor
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.font = "16px sans-serif"
			ctx.fillText(vertex.symbol, pos1[0], pos1[1])
		}
		
		ctx.restore()
	}
	
	ctx.save()
	
	var vertexClass = Vertices.getById(currType).prototype
	var pos1 = [
		world.RAD + 10,
		innerHeight - world.RAD - 10
	]
	
	ctx.fillStyle = vertexClass.color
	ctx.strokeStyle = vertexClass.border
	
	ctx.beginPath()
	
	ctx.arc(pos1[0], pos1[1], world.RAD, 0, 2 * Math.PI, true)
	
	ctx.closePath()
	ctx.fill()
	ctx.stroke()
	
	if(vertexClass.icon){
		pos1 = [
			pos1[0] - Math.SQRT1_2 * world.RAD,
			pos1[1] + Math.SQRT1_2 * world.RAD
		]
		var pos2 = [
			pos1[0] + Math.SQRT1_2 * world.RAD,
			pos1[1] - Math.SQRT1_2 * world.RAD
		]
		Vec2.subtract(pos2, pos1, pos2)
		ctx.drawImage(vertexClass.icon, pos1[0], pos1[1], pos2[0], pos2[1])
	}
	else if(vertexClass.symbol){
		ctx.fillStyle = vertexClass.textColor
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.font = "16px sans-serif"
		ctx.fillText(vertexClass.symbol, pos1[0], pos1[1])
	}
	
	ctx.restore()
	
	requestAnimationFrame(drawLoop)
}

setInterval(updateLoop, 50/3)
requestAnimationFrame(drawLoop)

//})()