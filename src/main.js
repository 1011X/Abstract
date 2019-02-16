"use strict"

Math.TAU = 2 * Math.PI

const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

let world = new World

let selected = null // vertex clicked on mousedown
let currVert = 1 // vertex type selected for placement
let currEdge = 0 // edge type (arc or regular edge) being used
let fps = 0 // used to save previous second's fps
let frameCounter = 0
// let vectorPool = new ObjectPool(Vec2, 10)

let canvasPos = null
let prevCanvasPos = null
let selectedVertices = new Set

let paused = false
var debug = false
let hasDragged = false
let selecting = false
let autosave = false

function save() {
	localStorage["gameData"] = JSON.stringify({
		currVert: Vertex.registry.getName(currVert),
		currEdge,
		world
	})
}

function load() {
	if(!localStorage["gameData"]) {
		world = new World
		currVert = 1
        if(!localStorage["gameData"]) {
            showTutorial()
        }
	}
	else {
		let game = JSON.parse(localStorage["gameData"])
		world = World.fromJSON(game.world)
		currVert = Vertex.registry.getId(game.currVert)
		currEdge = game.currEdge
	}
}

function showTutorial() {
    alert(
`Controls:
    T key: show this tutorial
    S key: manually save the world
    C key: toggle autosaving (default: enabled)
    Z key: use arc connections
    X key: use edge connections`)
    alert(
`Current selection will be shown in the bottom left corner.
Scroll the mouse wheel to select a vertex type.
Right click to place a vertex or (in the case of the switch) interact with it.
Right click and drag from one vertex to another to connect them.
Left click and drag to move a vertex or to pan the world.
Left click a vertex to delete it.`)
    alert("Enjoy!")
}



// Load world data, if any
//load()

// If mouse is down and dragged, record position in worldPos.
// Also handles moving of vertex if one is selected and dragged.
function dragAction(evt) {
	let uaHas = subs => navigator.userAgent.indexOf(subs) !== -1
	hasDragged = true
	
	if(evt.ctrlKey) {
	    selecting = true
	    canvasPos = new Vec2(evt.pageX, evt.pageY)
	}
	else {
	    prevCanvasPos = canvasPos
	    
	    canvasPos = new Vec2(evt.pageX, evt.pageY)
	    let worldPos = canvasPos.clone().add(world.cam)
	    
	    // Helps to differentiate between mouse buttons in different browsers.
	    // The reason it works is because the mouseup event for Firefox has the
	    // releasing button information in the "buttons" attribute, but Chrome
	    // has it on the "button" attribute.
	    if(uaHas("Firefox") && evt.buttons == 1 || uaHas("Chrome") && evt.button == 0) {
		    // if a vertex was selected,
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
}

/// Handle user input

// register event handlers
canvas.addEventListener("wheel", evt => {
	// ensure ctrl is up, otherwise browser will zoom and
	// cycle through vertices at the same time
	evt.preventDefault()
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
	
	if(evt.ctrlKey) {
	    prevCanvasPos = new Vec2(evt.pageX, evt.pageY)
	}
	else {
        canvasPos = new Vec2(evt.pageX, evt.pageY)
	    let worldPos = canvasPos.clone().add(world.cam)
	    selected = world.vertexAt(worldPos)
    }
})

canvas.addEventListener("mouseup", evt => {
	canvas.removeEventListener("mousemove", dragAction)
	
	// left release
	if(evt.button == 0) {
		// remove vertex if there was a vertex and there was no dragging
		if(selected !== null && !hasDragged) {
			world.despawn(selected)
		}
		// TODO: remove connection
		else {
		    // this should be done by drawing a red line segment that, when
		    // intersecting any connection, deletes that connection.
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
	selecting = false
	selected = null
	
	prevCanvasPos = null
	canvasPos = null
})

window.addEventListener("keydown", evt => {
	if(evt.key === 's') { // s
		// manually save the world
		save()
	}
	else if(evt.key === 'e') {
		// toggle current connection type
		if(currEdge === 0) {
			currEdge = 1
		}
		else {
			currEdge = 0
		}
	}
	else if(evt.key === 'z') {
	    currEdge = 1
    }
    else if(evt.key === 'x') {
        currEdge = 0
    }
    else if(evt.key === 'c') {
        autosave = !autosave
    }
    else if(evt.key === 't') {
        showTutorial()
    }
	else if(evt.key === "Escape") {
	    if(selectedVertices.size > 0) {
	        selectedVertices.clear()
	    }
	    else {
    		paused = !paused
		}
	}
	else if(evt.key === "F3") {
		evt.preventDefault()
		frameCounter = 0
		fps = 0
		debug = !debug
	}
	else if(evt.key === "Delete") {
	    if(selectedVertices.size > 0) {
	        for(let vertex of selectedVertices) {
	            world.despawn(vertex)
	        }
	        selectedVertices.clear()
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

function drawArc(begin, end) {
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
	    alert(`Paused.\nAutosave: ${autosave ? 'enabled' : 'disabled'}`)
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
	for(let arc of world.graph.arcs) {
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
        
		drawArc(from, to)
	}
	
	// currently creating a connection
	if(selected !== null) {
	    // TODO dynamically draw temporal connection, depending on game state.
    }
	
	// vertex drawing procedure
	for(let vertex of world.vertices) {
		// get position relative to canvas
		let pos = vertex.pos.clone().sub(world.cam)
		
		// if inside the selection box, put in selectedVertices
		if(selecting) {
		    let inside = prevCanvasPos.x < pos.x && pos.x < canvasPos.x
		        && prevCanvasPos.y < pos.y && pos.y < canvasPos.y
	        if(inside) {
	            selectedVertices.add(vertex)
	        }
	        else {
	            selectedVertices.delete(vertex)
	        }
		}
		
		drawVertex(pos, vertex.radius, vertex.style)
		
		// draw rotating selection "ring"
		if(selectedVertices.has(vertex)) {
		    let dt = (time / 1000) % Math.TAU
		    ctx.save()
		    ctx.lineWidth = 2.5
        	ctx.lineCap = "butt"
		    ctx.strokeStyle = 'rgb(255, 255, 0)'
		    ctx.setLineDash([15, 15])
		    ctx.beginPath()
		    ctx.arc(...pos, vertex.radius, 0 + dt, Math.TAU + dt)
		    ctx.closePath()
		    ctx.stroke()
		    ctx.restore()
		}
	}
	
	
	// draw selection box
	if(selecting) {
	    ctx.save()
	    
	    ctx.fillStyle = 'rgba(230, 230, 0, 0.4)'
	    ctx.strokeStyle = 'yellow'
	    let rectSize = canvasPos.clone().sub(prevCanvasPos)
	    
	    ctx.fillRect(...prevCanvasPos, ...rectSize)
	    ctx.strokeRect(...prevCanvasPos, ...rectSize)
	    
	    ctx.restore()
	}
	
	
	// draw UI/current selection
	let pos = new Vec2(10, innerHeight - 10)
	
	let strings = [
	    `vertex: ${Vertex.registry.getName(currVert)}`,
	    `connection: ${currEdge ? 'arc' : 'edge'}`,
    ]
	
	ctx.font = "18px sans-serif"
	
	for(let str of strings.reverse()) {
    	ctx.fillText(str, ...pos)
	    pos.y -= 18
    }
	
	
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
setInterval(() => {if(autosave) save()}, 60 * 1000)
requestAnimationFrame(drawLoop)

showTutorial()
