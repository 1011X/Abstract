"use strict"

Math.TAU = 2 * Math.PI

// register vertex types
const Vertices = new RegistryWithDefault("blank")
Vertices.add(0, "blank", null)
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
	world.cam = new Vec2(...data.cam)
	
	let vertices = []
	for(let vertObj of data.vertices) {
		let vertexClass = Vertices.get(vertObj.type)
		let vertex = new vertexClass(world.graph)
		vertex.pos = new Vec2(...vertObj.pos)
		vertex.motion = new Vec2(...vertObj.motion)
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
	for(let arcObj of data.arcs) {
		let from = vertices[arcObj.from]
		let to = vertices[arcObj.to]
		let arc = new Arc(from, to)
		arc.weight = arcObj.value.weight
		arc.delay = arcObj.value.delay
		arcs.push(arc)
		world.graph.setArc(from, to, arc)
	}
}

function save() {
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


// If mouse is down and dragged, record position in worldPosition.
// Also handles moving of vertex if one is selected and dragged.
function dragAction(evt) {
	let uaHas = subs => navigator.userAgent.indexOf(subs) !== -1
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
			worldPosition.cloneFrom(selected.pos)
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
	
	if(currType < 0) {
		currType += Vertices.size
	}
	else if(currType >= Vertices.size) {
		currType -= Vertices.size
	}
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
			let vertexClass = Vertices.getById(currType)
			
			if(vertexClass != null) {
				let vertex = new vertexClass(world.graph)
				vertex.pos = new Vec2(...worldPosition)
				world.spawn(vertex)
				console.log(`Vertex placed at ${worldPosition}`)
			}
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
	if(evt.keyCode == 83) {
		save()
	}
	// 'r' is pressed
	if(evt.keyCode == 82) {
		localStorage["abstractWorldData"] = ""
	}
})

canvas.addEventListener("contextmenu", evt => {
	evt.preventDefault()
})

window.addEventListener("resize", evt => {
	canvas.width = innerWidth
	canvas.height = innerHeight
})
dispatchEvent(new Event("resize"))


function updateLoop() {
	world.tick(selected)
}

function drawLoop() {
	requestAnimationFrame(drawLoop)
	
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.lineWidth = 3
	ctx.lineCap = "square"
	
	// arc drawing procedure
	for(let arc of world.graph.arcs){
		let from = arc.from.pos.clone()
		let to = arc.to.pos.clone()
		
		// To canvas coordinates
		from.subtract(world.cam)
		to.subtract(world.cam)
		
		// get offset from center of vertex to its edge
		const fromOffset = to.clone()
			.subtract(from)
			.resize(arc.from.radius)
		const toOffset = from.clone()
			.subtract(to)
			.resize(arc.to.radius)
		
		// adjust line start and end positions
		const tail = from.clone().add(fromOffset)
		const head = to.clone().add(toOffset)
		
		// used to calculate positions of tips of both arrowheads
		const angle = 5 * Math.TAU / 12
		const arrowHead = head.clone()
			.subtract(tail)
			.resize(16)
		const tipl = arrowHead.clone()
			.rotate(angle)
			.add(head)
		const tipr = arrowHead.clone()
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
		let pos1 = new Vec2(...vertex.pos).subtract(world.cam)
		ctx.save()
		
		ctx.fillStyle = vertex.style.color
		ctx.strokeStyle = vertex.style.border
		
		ctx.beginPath()
		
		ctx.arc(...pos1, vertex.radius, 0, Math.TAU)
		
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
		
		// if there's an icon...
		/*
		if(vertex.icon) {
			// calculate width and height for icon
			let offset = new Vec2(1, 1)
				.scale(2 * Math.SQRT1_2 * vertex.radius)
				// set pos1 to most top-left point on circle
			pos1.subtract(offset)
			ctx.drawImage(vertex.icon, ...pos1, ...offset)
		}
		else */
		if(vertex.style.symbol) {
			ctx.fillStyle = vertex.style.textColor
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.font = "16px sans-serif"
			ctx.fillText(vertex.style.symbol, ...pos1)
		}
		
		ctx.restore()
	}
	
	ctx.save()
	
	let vertexClass = Vertices.getById(currType)
	
	if(vertexClass != null) {
		let style = vertexClass.prototype.style
		let pos1 = new Vec2(
			/*world.RAD*/ 20 + 10,
			innerHeight - /*world.RAD*/ 20 - 10
		)
		
		ctx.fillStyle = style.color
		ctx.strokeStyle = style.border
		
		ctx.beginPath()
	
		ctx.arc(...pos1, vertexClass.prototype.radius, 0, Math.TAU)
	
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
	
		/*
		if(vertexClass.icon) {
				// calculate offset for most bottom-right point on circle
				var offset = new Vec2(1, 1)
					.scale(2 * Math.SQRT1_2 * world.RAD)
				// set pos1 to most top-left point on circle
				pos1.subtract(offset)
				ctx.drawImage(vertexClass.icon, ...pos1, ...offset)
		}
		else*/
		if(style.symbol) {
			ctx.fillStyle = style.textColor
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.font = "16px sans-serif"
			ctx.fillText(style.symbol, ...pos1)
		}
	
		ctx.restore()
	}
}

setInterval(updateLoop, 50/3)
requestAnimationFrame(drawLoop)
