(function main(){
"use strict"

// register vertex types
const Vertices = new RegistryWithDefault("blank")
Vertices.add(0, "blank", Vertex)
Vertices.add(1, "rotator", VertexRotator)
Vertices.add(2, "neuron", VertexNeuron)
Vertices.add(3, "feedback", VertexFeedback)
Vertices.add(4, "switch", VertexSwitch)
Vertices.add(5, "min", VertexMin)
Vertices.add(6, "max", VertexMax)
Vertices.add(7, "inverse", VertexInverse)
Vertices.add(8, "one", VertexOne)
Vertices.add(9, "add", VertexAdd)

var Renders = new RegistryWithDefault("blank")
//Renders.add(0, "blank", )

const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

function load(){
	var data = JSON.parse(localStorage["abstractWorldData"])
	world.cam = data.cam
	
	var vertices = []
	for(var vertObj of data.vertices){
		var vertexClass = Vertices.get(vertObj.type)
		var vertex = new vertexClass(world.graph)
		vertex.pos = vertObj.pos
		vertex.motion = vertObj.motion
		vertex.inputs = vertObj.inputs
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

function save(){
	localStorage["abstractWorldData"] = JSON.stringify(world, null, "\t")
}

var world = new World
// Load world data, if there is any
if(localStorage["abstractWorldData"])
	load()

var selected = null
var currType = 0
var doDrawing = true
// var vectorPool = new ObjectPool(Vec2.create64, 10)

var canvasPosition = null
var prevCanvasPosition = null

var worldPosition = null
var prevWorldPosition = null
var hasDragged = false

function uaHas(subs){
	return navigator.userAgent.indexOf(subs) !== -1
}

// If mouse is down and dragged, record position in worldPosition.
// Also handles moving of vertex if one is selected and dragged.
function dragAction(evt){
	hasDragged = true
	
	prevCanvasPosition = canvasPosition
	prevWorldPosition = worldPosition
	
	canvasPosition = [evt.pageX, evt.pageY]
	worldPosition = Vec2.add(canvasPosition, world.cam)
	
	// Helps to differentiate between mouse buttons in different browsers.
	// The reason it works is because the mouseup event for Firefox has the
	// releasing button information in the "buttons" attribute, but Chrome
	// has it on the "button" attribute.
	if(uaHas("Firefox") && evt.buttons == 1 || uaHas("Chrome") && evt.button == 0){
		if(selected){
			Vec2.copy(worldPosition, selected.pos)
		}
		else {
			var canvasMovement = Vec2.subtract(canvasPosition, prevCanvasPosition)
			Vec2.reverse(canvasMovement, canvasMovement)
			Vec2.add(world.cam, canvasMovement, world.cam)
		}
	}
}


// register event handlers
canvas.addEventListener("wheel", function(evt){
	currType += evt.deltaY
	if(currType < 0)
		currType += Vertices.size
	else if(currType >= Vertices.size)
		currType -= Vertices.size
})

canvas.addEventListener("mousedown", function(evt){
	canvas.addEventListener("mousemove", dragAction)
	
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
				var arc = new Arc(selected, next)
				world.connect(selected, next, arc)
			}
			// TODO: implement some sort of context menu here
			else if(selected === next){
				selected.action()
			}
		}
		// make new vertex if released in blank area and mouse wasn't dragged
		else if(!selected && !next && !hasDragged){
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

window.addEventListener("keydown", function(evt){
	// 's' is pressed
	if(evt.keyCode == 83)
		save()
	// 'r' is pressed
	if(evt.keyCode == 82)
		localStorage["abstractWorldData"] = ""
})

window.addEventListener("keyup", function(evt){
	
})

canvas.addEventListener("contextmenu", function(evt){
	evt.preventDefault()
})

window.addEventListener("resize", function(evt){
	canvas.width = innerWidth
	canvas.height = innerHeight
})
dispatchEvent(new Event("resize"))


function drawVertex(ctx, style, pos){
	// NOTE: modifies pos parameter!
	ctx.save()
	
	ctx.fillStyle = style.color
	ctx.strokeStyle = style.borderColor
	
	ctx.beginPath()
	
	ctx.arc(pos[0], pos[1], world.RAD, 0, 2 * Math.PI, true)
	
	ctx.fill()
	ctx.stroke()
	
	// if there's an icon...
	if(style.icon){
		// calculate offset for most bottom-right point on circle
		var offset = [1, 1]
		Vec2.scale(offset, Math.SQRT2 * world.RAD, offset)
		// set pos1 to most top-left point on circle
		Vec2.subtract(pos, offset, pos)
		ctx.drawImage(style.icon, pos[0], pos[1], 2 * offset[0], 2 * offset[1])
	}
	else if(style.symbol){
		ctx.fillStyle = style.textColor
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.font = "15px sans-serif"
		ctx.fillText(style.symbol, pos[0], pos[1])
	}
	
	ctx.closePath()
	ctx.restore()
}

function Render(style){
	var canvas = document.createElement("canvas")
	canvas.width = canvas.height = 2 * (world.RAD + 2)
	var context = canvas.getContext("2d")
	
	drawVertex(context, style, [canvas.width / 2, canvas.height / 2])
	
	return canvas
}

function updateLoop(){
	world.tick(selected)
}

function drawLoop(){
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
		
		// used to calculate positions of tips of both arrowheads
		var angle = 5 * Math.PI / 6
		var arrowHead = Vec2.resize(Vec2.subtract(head, tail), 2 * world.RAD / 3)
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
		// get position relative to canvas
		var pos1 = Vec2.subtract(vertex.pos, world.cam)
		drawVertex(ctx, vertex.style, pos1)
	}
	
	var vertexClass = Vertices.getById(currType).prototype
	var pos1 = [
		world.RAD + 10,
		innerHeight - world.RAD - 10
	]
	
	drawVertex(ctx, vertexClass.style, pos1)
	
	requestAnimationFrame(drawLoop)
}

setInterval(updateLoop, 50/3)
requestAnimationFrame(drawLoop)

})()
