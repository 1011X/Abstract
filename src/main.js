/// TODO
/// * Add Rust-like iterators to replace manual `for` loops?
"use strict"

Math.TAU = 2 * Math.PI

const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

let world = null

let selected = null // vertex clicked on mousedown
let currVert = 0 // vertex type selected for placement
let currEdge = 0 // edge type (arc or regular edge) being used
let fps = 0 // used to save previous second's fps
let frameCounter = 0
// let vectorPool = new ObjectPool(Vec2, 10)

let canvasPos = null
let prevCanvasPos = null

let paused = false
var debug = false
let hasDragged = false

function save() {
	localStorage["gameData"] = JSON.stringify({
		currVert: Vertex.registry.getName(currVert),
		currEdge: currEdge,
		world
	})
}

function load() {
	if(!localStorage["gameData"]) {
		world = new World
		currVert = 1
        if(!localStorage["gameData"]) {
            alert(
`Controls:
    S key: save the world
    E key: toggle connection type
    F3: view debug information
    scroll: select vertex type
    right click: place or interact with vertex
    left click: delete vertex`
            )
        }
	}
	else {
		let game = JSON.parse(localStorage["gameData"])
		world = World.fromJSON(game.world)
		currVert = Vertex.registry.getId(game.currVert)
		currEdge = game.currEdge
	}
}

// Load world data, if any
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
		if(selected !== null) {
			// ensure it's not the Anchor type
			if(!(selected instanceof Vertex.Anchor)) {
				selected.pos.cloneFrom(worldPos)
			}
		}
		// otherwise, move the camera
		else {
			let canvasMovement = canvasPos.clone()
				.sub(prevCanvasPos)
				.reverse()
			world.cam.add(canvasMovement)
		}
	}
}

/// Handle user input

// register event handlers
canvas.addEventListener("wheel", evt => {
	// ensure ctrl is up, otherwise browser will zoom and
	// cycle through vertices at the same time
	if(!evt.ctrlKey) {
		let delta = Math.sign(evt.deltaY)
		
		// skip the vertex type at 0 because it's the "none"
		// type and we don't want it.
		if(delta === -1 && currVert === 1) {
			currVert = Vertex.registry.size - 1
		}
		else if(delta === 1 && currVert === Vertex.registry.size - 1) {
			currVert = 1
		}
		else {
			currVert += delta
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
					world.edgeConnect(selected, next)
				}
				else {
					world.arcConnect(selected, next)
				}
			}
		}
		// make new vertex if released in blank area and mouse wasn't dragged
		else if(selected === null && next === null && !hasDragged) {
			let vertexClass = Vertex.registry.get(currVert)
			
			if(vertexClass != null) {
				let vertex = new vertexClass
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
	if(evt.keyCode === 83) {
		// save the world
		save()
	}
	// 'e' is pressed
	else if(evt.keyCode === 69) { // nice
		// toggle current connection type
		if(currEdge === 0) {
			currEdge = 1
		}
		else {
			currEdge = 0
		}
	}
	else if(evt.keyCode === 27) { // esc
		paused = !paused
	}
	else if(evt.keyCode === 114) { // f3
		evt.preventDefault()
		frameCounter = 0
		fps = 0
		debug = !debug
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


function drawVertex(pos, radius, style) {
	ctx.save()
	
	if(style.gradient === VertexStyle.RADIAL_GRADIENT) {
		let radialGradient = ctx.createRadialGradient(...pos, 0, ...pos, radius)
		
		radialGradient.addColorStop(0, "white")
		radialGradient.addColorStop(1, style.color)

		ctx.fillStyle = radialGradient
	}
	else {
		ctx.fillStyle = style.color
	}

	ctx.strokeStyle = style.border

	ctx.beginPath()
	ctx.arc(...pos, radius, 0, Math.TAU)
	ctx.closePath()
	ctx.fill()
	ctx.stroke()

	if(style.symbol) {
		ctx.fillStyle = style.textColor
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.font = "bold 20px serif"
		ctx.fillText(style.symbol, ...pos)
	}
	
	ctx.restore()
}

function drawEdge(begin, end) {
	ctx.beginPath()
	ctx.moveTo(...begin)
	ctx.lineTo(...end)
	ctx.closePath()
	ctx.stroke()
}
/*
function drawArc(begin, end, opp_head = false) {
	ctx.beginPath()
	// draw dashed line
	ctx.setLineDash([7, 10])
	ctx.moveTo(...begin)
	ctx.lineTo(...end)
	ctx.stroke()
	
	const ANGLE = Math.TAU / 12
	let line = begin.clone().sub(end)
	let tip = line.clone()
		.resize(16)
		.rotate(ANGLE)
		.add(end)
	
	// draw arrowhead
	ctx.beginPath()
	ctx.setLineDash([])
	ctx.moveTo(...end)
	ctx.lineTo(...tip)
	ctx.moveTo(...end)
	
	tip.sub(end)
		.rotate(-2 * ANGLE)
		.add(end)
	
	ctx.lineTo(...tip)
	ctx.moveTo(...end)
	ctx.closePath()
	ctx.stroke()
	
	// draw back arrowhead if told to
	if(opp_head) {
		line.reverse()
		tip.cloneFrom(line)
		tip.resize(16)
			.rotate(ANGLE)
			.add(begin)
		
		ctx.beginPath()
		ctx.moveTo(...begin)
		ctx.lineTo(...tip)
		ctx.moveTo(...begin)
		
		tip.sub(begin)
			.rotate(-2 * ANGLE)
			.add(begin)
		
		ctx.lineTo(...tip)
		ctx.moveTo(...end)
		ctx.closePath()
		ctx.stroke()
	}
}
*/

function drawArc(begin, end, opp_head = false) {
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    
    let start_offset = end.clone()
        .sub(begin)
        .rotate(Math.TAU / 4)
        .resize(10)
    
	ctx.beginPath()
	ctx.moveTo(...start_offset.add(begin))
	ctx.lineTo(...end)
	start_offset.sub(begin).reverse()
	ctx.lineTo(...start_offset.add(begin))
	ctx.closePath()
	ctx.fill()
	
	ctx.restore()
}


function updateLoop() {
	if(!paused) {
		world.tick()
	} else {
	    alert("paused")
	    paused = false
	}
}

// TODO implement motion blur (once motion is added)
function drawLoop(time) {
	requestAnimationFrame(drawLoop)
	
	ctx.lineWidth = 3
	ctx.lineCap = "round"
	
	ctx.clearRect(0, 0, innerWidth, innerHeight)
	
	// edge drawing procedure
	for(let edge of world.graph.edges) {
		edge = edge.toArray()
		
		let from = edge[0].pos.clone()
			.sub(world.cam)
		
		let to = edge[1].pos.clone()
			.sub(world.cam)
		
		// tmp vector to reduce allocations
		let vec = to.clone().sub(from)
		
	    // adds offsets from vertex center to its circumference respectively
	    vec.resize(edge[0].radius)
        from.add(vec)
        vec.resize(edge[1].radius).reverse()
        to.add(vec)
		
		// adjust line start and end positions
		drawEdge(from, to)
	}
	
	// arc drawing procedure
	//let alreadyDrawn = new Set
	for(let arc of world.graph.arcs) {
	    /*
		let opposite = world.graph.getArc(arc.to, arc.from)
		
		if(alreadyDrawn.has(arc) || alreadyDrawn.has(opposite)) {
			continue
		}
		*/
		let from = arc.from.pos.clone()
			.sub(world.cam)
		
		let to = arc.to.pos.clone()
			.sub(world.cam)
		
		// tmp vector to reduce allocations
		let vec = to.clone().sub(from)
	    
	    // adds offsets from vertex center to its circumference respectively
	    vec.resize(arc.from.radius)
        from.add(vec)
        vec.resize(arc.to.radius).reverse()
        to.add(vec)
        
		drawArc(from, to, false)
		
		/*
		alreadyDrawn.add(arc)
		if(opposite !== null) {
			alreadyDrawn.add(opposite)
		}
		*/
	}
	
	// vertex drawing procedure
	for(let vertex of world.vertices) {
		// get position relative to canvas
		let pos = vertex.pos.clone().sub(world.cam)
		drawVertex(pos, vertex.radius, vertex.style)
	}
	
	
	// draw UI
	let pos = new Vec2(10, innerHeight - 10)
	
	let current_vertex = `vertex: ${Vertex.registry.getName(currVert)}`
	let current_connection = `connection: ${currEdge ? 'arc' : 'edge'}`
	
	// draw name of current vertex
	ctx.font = "18px sans-serif"
	ctx.fillText(current_vertex, ...pos)
	
	pos.y -= 18
	
    ctx.fillText(current_connection, ...pos)
	
	
	if(debug) {
		frameCounter += 1
		if(time % 1000 < 16.6) {
			fps = frameCounter
			frameCounter = 0
		}
		
		ctx.save()
		ctx.textBaseline = "top"
		ctx.fillText(`FPS: ${fps}`, 10, 10)
		ctx.restore()
	}
}

setInterval(updateLoop, 50/3)
//setInterval(save, 60 * 1000)
requestAnimationFrame(drawLoop)
