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

const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

function load(){
	var data = JSON.parse(localStorage["abstractWorldData"])
	world.cam = data.cam
	
	var vertices = []
	for(let vertObj of data.vertices) {
		var vertexClass = Vertices.get(vertObj.type)
		var vertex = new vertexClass(world.graph)
		vertex.pos = vertObj.pos
		vertex.motion = vertObj.motion
		vertex.inputs = vertObj.inputs
		vertices.push(vertex)
		world.graph.add(vertex)
	}
	
	var markedForUpdates = []
	for(let vertObj of data.markedForUpdates)
		markedForUpdates.push(vertices[vertObj])
	
	world.markedForUpdates = new Set(markedForUpdates)
	
	var arcs = []
	for(let arcObj of data.arcs){
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
if(localStorage["abstractWorldData"]) {
	load()
}

var selected = null
var currType = 0
var doDrawing = true
// var vectorPool = new ObjectPool(Vec2.create64, 10)

var canvasPosition = null
var prevCanvasPosition = null

var worldPosition = null
var prevWorldPosition = null
var hasDragged = false

let uaHas = subs => navigator.userAgent.indexOf(subs) !== -1

// If mouse is down and dragged, record position in worldPosition.
// Also handles moving of vertex if one is selected and dragged.
function dragAction(evt) {
	hasDragged = true
	
	prevCanvasPosition = canvasPosition
	prevWorldPosition = worldPosition
	
	canvasPosition = new Option(new Vec2(evt.pageX, evt.pageY))
	worldPosition = new Option(canvasPosition.clone().add(world.cam))
	
	// Helps to differentiate between mouse buttons in different browsers.
	// The reason it works is because the mouseup event for Firefox has the
	// releasing button information in the "buttons" attribute, but Chrome
	// has it on the "button" attribute.
	if(uaHas("Firefox") && evt.buttons == 1 || uaHas("Chrome") && evt.button == 0) {
		if(selected) {
			worldPosition[0] = selected.pos[0]
			worldPosition[1] = selected.pos[1]
		}
		else {
			let canvasMovement = canvasPosition.clone()
				.subtract(prevCanvasPosition)
				.reverse()
			world.cam.add(canvasMovement)
		}
	}
}


// register event handlers
canvas.addEventListener("wheel", evt => {
	currType += evt.deltaY
	if(currType < 0)
		currType += Vertices.size
	else if(currType >= Vertices.size)
		currType -= Vertices.size
})

canvas.addEventListener("mousedown", evt => {
	canvas.addEventListener("mousemove", dragAction)
	
	canvasPosition = new Vec2(evt.pageX, evt.pageY)
	worldPosition = canvasPosition.clone().add(world.cam)
	
	selected = world.vertexAt(worldPosition)
})

canvas.addEventListener("mouseup", evt => {
	canvas.removeEventListener("mousemove", dragAction)
	
	// left release
	if(evt.button == 0) {
		// remove if there's a vertex and there was no dragging
		if(selected && !hasDragged)
			world.despawn(selected)
	}
	// right release
	else if(evt.button == 2) {
		let next = world.vertexAt(worldPosition)
		// a vertex was present on mousedown and on mouseup
		if(selected !== null && next !== null) {
			// connect vertices if released on a different vertex
			if(selected !== next) {
				let arc = new Arc(selected, next)
				world.connect(selected, next, arc)
			}
			// TODO: implement some sort of context menu here
			else if(selected === next) {
				selected.action()
			}
		}
		// make new vertex if released in blank area and mouse wasn't dragged
		else if(selected === null && next === null && !hasDragged) {
			var vertex = new (Vertices.getById(currType))(world.graph)
			vertex.pos = Vec2.create(worldPosition)
			world.spawn(vertex)
			console.log(`Vertex placed at ${Vec2.toString(worldPosition)}`)
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

window.addEventListener("keydown", evt => {
	// 's' is pressed
	if(evt.keyCode == 83)
		save()
	// 'r' is pressed
	if(evt.keyCode == 82)
		localStorage["abstractWorldData"] = ""
})

window.addEventListener("keyup", evt => {
	
})

canvas.addEventListener("contextmenu", evt => {
	evt.preventDefault()
})

window.addEventListener("resize", evt => {
	canvas.width = innerWidth
	canvas.height = innerHeight
})
dispatchEvent(new Event("resize"))


function updateLoop(){
	world.tick(selected)
}

function drawLoop(){
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.lineWidth = 3
	ctx.lineCap = "square"
	
	// arc drawing procedure
	for(let arc of world.graph.arcs){
		let from = new Vec2(...arc.from.pos)
		let to = new Vec2(...arc.to.pos)
		
		// To canvas coordinates
		from.subtract(world.cam)
		to.subtract(world.cam)
		
		// get offset from center of vertex to its edge
		let offset = new Vec2(...to)
			.subtract(from)
			.resize(world.RAD)
		
		// adjust line start and end positions
		let tail = new Vec2(...from).add(offset)
		let head = new Vec2(...to).add(offset)
		
		// used to calculate positions of tips of both arrowheads
		const angle = 5 * Math.TAU / 12
		let arrowHead = new Vec2(...head)
			.subtract(tail)
			.resize(2 * world.RAD / 3)
		let tipl = new Vec2(...arrowHead)
			.rotate(angle)
			.add(head)
		let tipr = new Vec2(...arrowHead)
			.rotate(-angle)
			.add(head)
		
		ctx.beginPath()
		
		ctx.moveTo(...tail)
		ctx.lineTo(...head)
		ctx.lineTo(...tipl)
		ctx.moveTo(...head)
		ctx.lineTo(...tipr)
		ctx.moveTo(...head)
		
		ctx.closePath()
		ctx.stroke()
	}
	
	// vertex drawing procedure
	for(var vertex of world.vertices){
		// get position relative to canvas
		var pos1 = new Vec2(...vertex.pos).subtract(world.cam)
		ctx.save()
		
		ctx.fillStyle = vertex.color
		ctx.strokeStyle = vertex.border
		
		ctx.beginPath()
		
		ctx.arc(...pos1, world.RAD, 0, Math.TAU, true)
		
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
		
		// if there's an icon...
		if(vertex.icon) {
			// calculate width and height for icon
			let offset = new Vec2(1, 1)
				.scale(2 * Math.SQRT1_2 * world.RAD)
				// set pos1 to most top-left point on circle
			pos1.subtract(offset)
			ctx.drawImage(vertex.icon, ...pos1, ...offset)
		}
		else if(vertex.symbol) {
			ctx.fillStyle = vertex.textColor
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.font = "16px sans-serif"
			ctx.fillText(vertex.symbol, ...pos1)
		}
		
		ctx.restore()
	}
	
	ctx.save()
	
	let vertexClass = Vertices.getById(currType).prototype
	let pos1 = new Vec2(
		world.RAD + 10,
		innerHeight - world.RAD - 10
	)
	
	ctx.fillStyle = vertexClass.color
	ctx.strokeStyle = vertexClass.border
	
	ctx.beginPath()
	
	ctx.arc(...pos1, world.RAD, 0, Math.TAU, true)
	
	ctx.closePath()
	ctx.fill()
	ctx.stroke()
	
	if(vertexClass.icon) {
			// calculate offset for most bottom-right point on circle
			var offset = new Vec2(1, 1)
				.scale(2 * Math.SQRT1_2 * world.RAD)
			// set pos1 to most top-left point on circle
			pos1.subtract(offset)
			ctx.drawImage(vertexClass.icon, ...pos1, ...offset)
	}
	else if(vertexClass.symbol) {
		ctx.fillStyle = vertexClass.textColor
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.font = "16px sans-serif"
		ctx.fillText(vertexClass.symbol, ...pos1)
	}
	
	ctx.restore()
	
	requestAnimationFrame(drawLoop)
}

setInterval(updateLoop, 50/3)
requestAnimationFrame(drawLoop)
