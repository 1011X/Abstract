/// TODO
/// * Do new vertex selection
/// * Add Rust-like iterator methods for manual `for` loops

"use strict"

Math.TAU = 2 * Math.PI

const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

let world = null

let selected = null // vertex clicked on mousedown
let currVert = 0 // vertex type selected for placement
let currEdge = 0 // edge type (arc or regular edge) being used
// let vectorPool = new ObjectPool(Vec2, 10)

let canvasPos = null
let prevCanvasPos = null

let hasDragged = false

function save() {
	localStorage["gameData"] = JSON.stringify({
		currVert: currVert,
		currEdge: currEdge,
		world
	})
}

function load() {
	if(!localStorage["gameData"]) {
		world = new World
	}
	else {
		let game = JSON.parse(localStorage["gameData"])
		world = World.fromJSON(game.world)
		currVert = game.selected || game.currVert
		currEdge = game.currEdge
	}
}

// Load world data, if there is any
load()

// If mouse is down and dragged, record position in worldPos.
// Also handles moving of vertex if one is selected and dragged.
function dragAction(evt) {
	let uaHas = subs => navigator.userAgent.indexOf(subs) !== -1
	hasDragged = true
	
	prevCanvasPos = canvasPos
	
	canvasPos = new Vec2(evt.pageX, evt.pageY)
	let worldPos = canvasPos.clone().add(world.cam)
	
	// Helps to differentiate between mouse buttons in different browsers.
	// The reason it works is because the mouseup event for Firefox has the
	// releasing button information in the "buttons" attribute, but Chrome
	// has it on the "button" attribute.
	if(uaHas("Firefox") && evt.buttons == 1 || uaHas("Chrome") && evt.button == 0) {
		// if a vertex was selected and it wasn't moving,
		// then move it according to the cursor's movement.
		if(selected !== null && selected.motion.isNull()) {
			// we use the Base type as an "anchor"
			if(!(selected.constructor === Vertex.Base)) {
				selected.pos.cloneFrom(worldPos)
			}
		}
		else {
			let canvasMovement = canvasPos.clone()
				.sub(prevCanvasPos)
				.reverse()
			world.cam.add(canvasMovement)
		}
	}
}

/// Deal with user input

// register event handlers
canvas.addEventListener("wheel", evt => {
	// ensure ctrl is up, otherwise browser will zoom and
	// cycle through vertices at the same time
	if(!evt.ctrlKey) {
		currVert += Math.sign(evt.deltaY)
		currVert %= Vertex.registry.size
	
		if(currVert < 0) {
			currVert += Vertex.registry.size
		}
	}
})

canvas.addEventListener("mousedown", evt => {
	canvas.addEventListener("mousemove", dragAction)
	
	canvasPos = new Vec2(evt.pageX, evt.pageY)
	let worldPos = canvasPos.clone().add(world.cam)
	
	selected = world.vertexAt(worldPos)
})

canvas.addEventListener("mouseup", evt => {
	canvas.removeEventListener("mousemove", dragAction)
	
	// left release
	if(evt.button == 0) {
		// remove if there's a vertex and there was no dragging
		if(selected !== null && !hasDragged) {
			world.despawn(selected)
		}
	}
	// right release
	else if(evt.button == 2) {
		let worldPos = canvasPos.clone().add(world.cam)
		let next = world.vertexAt(worldPos)
		
		// a vertex was present on mousedown and on mouseup
		if(selected !== null && next !== null) {
			// connect vertices if released on a different vertex
			if(selected === next) {
				selected.action()
			}
			else {
				if(currEdge === 0) {
					let edge = new Edge(selected, next)
					world.edgeConnect(selected, next, edge)
				}
				else {
					let arc = new Arc(selected, next)
					world.arcConnect(selected, next, arc)
				}
			}
		}
		// make new vertex if released in blank area and mouse wasn't dragged
		else if(selected === null && next === null && !hasDragged) {
			let vertexClass = Vertex.registry.getById(currVert)
			
			if(vertexClass != null) {
				let vertex = new vertexClass(world.graph)
				vertex.pos.cloneFrom(worldPos)
				world.spawn(vertex)
			}
		}
	}
	// reset EVERYTHING
	hasDragged = false
	selected = null
	
	prevCanvasPos = null
	canvasPos = null
})

window.addEventListener("keydown", evt => {
	// 's' is pressed
	if(evt.keyCode == 83) {
		save()
	}
	// 'r' is pressed
	if(evt.keyCode == 82) {
		localStorage.removeItem("gameData")
	}
	// 'e' is pressed
	if(evt.keyCode == 69) {
		if(currEdge === 0) {
			currEdge = 1
		}
		else {
			currEdge = 0
		}
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
	world.tick()
}

function drawLoop() {
	requestAnimationFrame(drawLoop)
	
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.lineWidth = 3
	ctx.lineCap = "round"
	
	// edge drawing procedure
	for(let edge of world.graph.edges) {
		edge = edge.toArray()
		
		let from = edge[0].pos.clone()
			.sub(world.cam)
		
		let to = edge[1].pos.clone()
			.sub(world.cam)
		
		// get offset from center of vertex to its edge
		const fromOffset = to.clone()
			.sub(from)
			.resize(edge[0].radius)
		
		const toOffset = from.clone()
			.sub(to)
			.resize(edge[1].radius)
		
		// adjust line start and end positions
		const tail = from.clone().add(fromOffset)
		const head = to.clone().add(toOffset)
		
		ctx.beginPath()
		ctx.moveTo(...tail)
		ctx.lineTo(...head)
		ctx.closePath()
		
		ctx.stroke()
	}
	
	// arc drawing procedure
	let alreadyDrawn = new Set
	for(let arc of world.graph.arcs){
		let fromVert = arc.from
		let toVert = arc.to
		
		let from = fromVert.pos.clone()
			.sub(world.cam)
		
		let to = toVert.pos.clone()
			.sub(world.cam)
		
		// get offset from center of vertex to its edge
		const fromOffset = to.clone()
			.sub(from)
			.resize(fromVert.radius)
		
		const toOffset = from.clone()
			.sub(to)
			.resize(toVert.radius)
		
		// adjust line start and end positions
		const tail = from.clone().add(fromOffset)
		const head = to.clone().add(toOffset)
		
		// used to calculate positions of tips of both arrowheads
		const angle = 5 * Math.TAU / 12
		const arrowHead = head.clone()
			.sub(tail)
			.resize(16)
		const tipl = arrowHead.clone()
			.rotate(angle)
			.add(head)
		const tipr = arrowHead.clone()
			.rotate(-angle)
			.add(head)
		
		// don't duplicate dotted line, otherwise it causes an
		// overlapping effect.
		if(!alreadyDrawn.has(arc) && !alreadyDrawn.has(world.graph.getArc(arc.to, arc.from))) {
			ctx.beginPath()
			ctx.setLineDash([15, 15])
			ctx.moveTo(...tail)
			ctx.lineTo(...head)
			ctx.stroke()
			alreadyDrawn.add(arc)
		}
		
		// but still allow the other arrow head to be drawn
		ctx.beginPath()
		ctx.setLineDash([])
		ctx.moveTo(...head)
		ctx.lineTo(...tipl)
		ctx.moveTo(...head)
		ctx.lineTo(...tipr)
		
		ctx.closePath()
		ctx.stroke()
	}
	
	// vertex drawing procedure
	for(let vertex of world.vertices) {
		// get position relative to canvas
		let pos = vertex.pos.clone().sub(world.cam)
		ctx.save()
		
		if(vertex.style.gradient === VertexStyle.RADIAL_GRADIENT) {
			let radialGradient = ctx.createRadialGradient(...pos, 0, ...pos, vertex.radius)
			
			if(vertex.style.textColor === "white") {
				radialGradient.addColorStop(0, "black")
				radialGradient.addColorStop(1, vertex.style.color)
			}
			else {
				radialGradient.addColorStop(0, "white")
				radialGradient.addColorStop(1, vertex.style.color)
			}
		
			ctx.fillStyle = radialGradient
		}
		else {
			ctx.fillStyle = vertex.style.color
		}
		
		ctx.strokeStyle = vertex.style.border
		
		ctx.beginPath()
		
		ctx.arc(...pos, vertex.radius, 0, Math.TAU)
		
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
		
		if(vertex.style.symbol) {
			ctx.fillStyle = vertex.style.textColor
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.font = "bold 18px sans-serif"
			ctx.fillText(vertex.style.symbol, ...pos)
		}
		
		ctx.restore()
	}
	
	ctx.save()
	
	// draw UI
	
	let vertexClass = Vertex.registry.getById(currVert)
	
	if(vertexClass != null) {
		let style = vertexClass.prototype.style
		let pos = new Vec2(
			/*world.RAD*/ 20 + 10,
			innerHeight - /*world.RAD*/ 20 - 10
		)
		
		ctx.fillStyle = style.color
		ctx.strokeStyle = style.border
		
		ctx.beginPath()
	
		ctx.arc(...pos, vertexClass.prototype.radius, 0, Math.TAU)
	
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
	
		if(style.symbol) {
			ctx.fillStyle = style.textColor
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.font = "bold 18px sans-serif"
			ctx.fillText(style.symbol, ...pos)
		}
	
		ctx.restore()
	}
	
	{
		let start = new Vec2(10 + 2 * 20 + 10, innerHeight - 13)
		let end = start.clone().add([33, -33])
		
		if(currEdge === 0) {
			ctx.beginPath()
			ctx.moveTo(...start)
			ctx.lineTo(...end)
			ctx.closePath()
			ctx.stroke()
		}
		else {
			const angle = 5 * Math.TAU / 12
			const arrowHead = end.clone()
				.sub(start)
				.resize(16)
			const tipl = arrowHead.clone()
				.rotate(angle)
				.add(end)
			const tipr = arrowHead.clone()
				.rotate(-angle)
				.add(end)
		
			ctx.beginPath()
			ctx.setLineDash([15, 15])
			ctx.moveTo(...start)
			ctx.lineTo(...end)
			ctx.stroke()
			
			ctx.beginPath()
			ctx.setLineDash([])
			ctx.moveTo(...end)
			ctx.lineTo(...tipl)
			ctx.moveTo(...end)
			ctx.lineTo(...tipr)
		
			ctx.closePath()
			ctx.stroke()
		}
	}
}

setInterval(updateLoop, 50/3)
setInterval(save, 60 * 1000)
requestAnimationFrame(drawLoop)
