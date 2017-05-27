/// TODO
/// * Do new vertex selection
/// * Add Rust-like iterator methods for manual `for` loops

"use strict"

Math.TAU = 2 * Math.PI

const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

// TODO have this as a deserialization function for World

// Load world data, if there is any
let world = null

let selected = null // vertex clicked on mousedown
let currType = 0 // vertex type selected for placement
// let vectorPool = new ObjectPool(Vec2.create64, 10)

let canvasPos = null
let prevCanvasPos = null

let hasDragged = false

function save() {
	localStorage["gameData"] = JSON.stringify({
		selected: currType,
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
		currType = game.selected
	}
}

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
		if(selected !== null && selected.motion.isNull()) {
			selected.pos.cloneFrom(worldPos)
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
	currType += evt.deltaY
	currType %= Vertex.registry.size
	
	if(currType < 0) {
		currType += Vertex.registry.size
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
				let arc = new Arc(selected, next)
				world.arcConnect(selected, next, arc)
			}
		}
		// make new vertex if released in blank area and mouse wasn't dragged
		else if(selected === null && next === null && !hasDragged) {
			let vertexClass = Vertex.registry.getById(currType)
			
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
		//localStorage.removeItem("abstractWorldData")
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
	ctx.lineCap = "square"
	
	// arc drawing procedure
	for(let {from: fromVert, to: toVert} of world.graph.arcs){
		let from = fromVert.pos.clone()
		let to = toVert.pos.clone()
		
		// To canvas coordinates
		from.sub(world.cam)
		to.sub(world.cam)
		
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
		let pos1 = vertex.pos.clone().sub(world.cam)
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
			ctx.font = "bold 16px sans-serif"
			ctx.fillText(vertex.style.symbol, ...pos1)
		}
		
		ctx.restore()
	}
	
	ctx.save()
	
	let vertexClass = Vertex.registry.getById(currType)
	
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
			ctx.font = "bold 16px sans-serif"
			ctx.fillText(style.symbol, ...pos1)
		}
	
		ctx.restore()
	}
}

setInterval(updateLoop, 50/3)
setInterval(save, 60 * 1000)
requestAnimationFrame(drawLoop)
