"use strict"

// register vertex types
let Vertices = new RegistryWithDefault("blank")
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

function load() {
	let data = JSON.parse(localStorage["abstractWorldData"])
	world.cam = data.cam
	
	let vertices = []
	for(let vertObj of data.vertices) {
		let vertexClass = Vertices.get(vertObj.type)
		let vertex = new vertexClass(world.graph)
		vertex.pos = vertObj.pos
		vertex.motion = vertObj.motion
		vertex.inputs = vertObj.inputs
		vertices.push(vertex)
		world.graph.add(vertex)
	}
	
	let markedForUpdates = []
	for(let vertObj of data.markedForUpdates) {
		markedForUpdates.push(vertices[vertObj])
	}
	
	world.markedForUpdates = new Set(markedForUpdates)
	
	let arcs = []
	for(let {from_i, to_i, value} of data.arcs) {
		let from = vertices[from_i]
		let to = vertices[to_i]
		let arc = new Arc(from, to)
		arc.weight = value.weight
		arc.delay = value.delay
		arcs.push(arc)
		world.graph.setArc(from, to, arc)
	}
}

function save(){
	localStorage["abstractWorldData"] = JSON.stringify(world, null, "\t")
}

let world = new World
// Load world data, if there is any
if(localStorage["abstractWorldData"]) {
	load()
}

let selected = null
let currType = 0
let doDrawing = true
// let vectorPool = new ObjectPool(Vec2.create64, 10)

let canvasPosition = null
let prevCanvasPosition = null

let worldPosition = null
let prevWorldPosition = null
let hasDragged = false

let uaHas = subs => navigator.userAgent.indexOf(subs) !== -1

// If mouse is down and dragged, record position in worldPosition.
// Also handles moving of vertex if one is selected and dragged.
function dragAction(evt) {
	hasDragged = true
	
	prevCanvasPosition = canvasPosition
	prevWorldPosition = worldPosition
	
	canvasPosition = new Vec2(evt.pageX, evt.pageY)
	worldPosition = canvasPosition.clone().add(world.cam)
	
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

/// Deal with user input

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
			// TODO: implement some sort of context menu here?
			else if(selected === next) {
				selected.action()
			}
		}
		// make new vertex if released in blank area and mouse wasn't dragged
		else if(selected === null && next === null && !hasDragged) {
			let vertex = new (Vertices.getById(currType))(world.graph)
			vertex.pos = worldPosition.clone()
			world.spawn(vertex)
			console.log(`Vertex placed at ${worldPosition}`)
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


/// Game loops

function updateLoop() {
	world.tick(selected)
}

function drawLoop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.lineWidth = 3
	ctx.lineCap = "square"
	
	// arc drawing procedure
	for(let {from, to} of world.graph.arcs){
		let from = from.pos.clone()
		let to = to.pos.clone()
		
		// To canvas coordinates
		from.subtract(world.cam)
		to.subtract(world.cam)
		
		// get offset from center of vertex to its edge
		let offset = to.clone()
			.subtract(from)
			.resize(world.RAD)
		
		// adjust line start and end positions
		let tail = from.clone().add(offset)
		let head = to.clone().add(offset)
		
		// used to calculate positions of tips of both arrowheads
		const angle = 5 * Math.TAU / 12
		let arrowHead = head.clone()
			.subtract(tail)
			.resize(2 * world.RAD / 3)
		let tipl = arrowHead.clone()
			.rotate(angle)
			.add(head)
		let tipr = arrowHead.clone()
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
	for(let vertex of world.vertices) {
		// get position relative to canvas
		let pos1 = vertex.pos.clone().subtract(world.cam)
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
		let offset = new Vec2(1, 1)
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
