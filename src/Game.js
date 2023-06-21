/// Stores information about the current game session.
class Game {
	constructor(canvas) {
		this.canvas = canvas
		this.ctx = canvas.getContext("2d")
		this.world = null
		
		this.dark_mode = false;
		
		//this.vectorPool = new ObjectPool(Vec2, 10)
		this.selectedVertices = new Set
		this.selectedConnections = null
		
		this.debug_panel = document.getElementById("debug-panel");
		// previous second's fps to display in debug menu
		this.fps = 0
		// frame counter for current second
		this.frameCounter = 0
		
		// handles all player mouse state
		this.mouse = new Mouse
		
		// object for handling mousemove
		// must save this object locally so it can be passed to
		// `removeEventListener` later. passing `this.onmousemove.bind(this)`
		// won't work because it creates a new, different function every time.
		this.mousemove_handler = {handleEvent: this.onmousemove.bind(this)}
		
		// whether player is currently selecting multiple vertices
		this.selecting = false
		
		// whether game is paused
		this.paused = false
		// whether autosaving of game state is enabled
		this.autosave_enabled = true;
		// whether local storage is possible
		this.has_local_storage = true
		// whether debug mode is on
		this.debug = false
		
		// vertex type selected for placement
		this.currVert = document.getElementById("vertex-select")
		// edge type (arc or regular edge) being used
		this.currEdge = document.getElementById("connection-select")
		
		// test if localStorage is accessible
		try {
			if(localStorage['gameData']) {
				let json = JSON.parse(localStorage['gameData'])
				this.world = World.fromJSON(json.world)
				//this.currVert = Vertex.registry.getId(json.currVert)
				this.currVert.value = json.currVert
				this.currEdge.value = json.currEdge ? 'arc' : 'edge'
				this.autosave_enabled = json.autosave_enabled;
			}
			else {
				this.world = new World
				this.showTutorial()
			}
		}
		catch(e) {
			console.error(e)
			this.has_local_storage = false
			this.world = new World
			this.showTutorial()
		}
		
		// register mouse, keyboard, and resize handlers
		canvas.addEventListener('wheel', this.onwheel.bind(this))
		canvas.addEventListener('mousedown', this.onmousedown.bind(this))
		canvas.addEventListener('mouseup', this.onmouseup.bind(this))
		canvas.addEventListener('contextmenu', this.oncontextmenu.bind(this))
		window.addEventListener('keydown', this.onkeydown.bind(this))
		window.addEventListener('resize', this.onresize.bind(this))
		
		if(window.matchMedia) {
			// make query to check if dark mode is enabled
			let query = window.matchMedia("(prefers-color-scheme: dark)");
			this.dark_mode = query.matches;
			// watch for changes
			query.addEventListener('change', e => this.dark_mode = e.matches);
		}
		
		this.onresize()
		
		// start update loop, save loop, and animation loop.
		setInterval(this.updateLoop.bind(this), 50/3)
		setInterval(this.autosave.bind(this), 60 * 1000)
		requestAnimationFrame(this.drawLoop.bind(this))
	}
	
	// checks if given vertex is being held by the player
	get selected() {
		return this.world.selected
	}
	
	set selected(vertex) {
		this.world.selected = vertex
	}
	
	// shows key controls and basic interactions to player
	showTutorial() {
		alert(
`Controls:
T key: show this tutorial
S key: manually save the world
C key: toggle autosaving (default: enabled)
Z key: use arc connections
X key: use edge connections`
		)
		alert(
`Current selection will be shown in the bottom left corner.
Scroll the mouse wheel to select a vertex type.
Right click to place a vertex or interact with it.
Right click and drag from one vertex to another to connect them.
Left click and drag to move a vertex or to pan the world.
Left click a vertex to delete it.`
		)
	}
	
	save() {
		if(this.has_local_storage) {
			localStorage["gameData"] = JSON.stringify(this)
			console.info("World saved!");
		}
	}
	
	autosave() {
		if(this.autosave_enabled) {
			this.save();
		}
	}
	
	toJSON() {
		return {
			//currVert: Vertex.registry.getName(this.currVert),
			autosave_enabled: this.autosave_enabled,
			currVert: this.currVert.value,
			currEdge: this.currEdge.value,
			world: this.world,
		}
	}
	
	onresize(_) {
		this.canvas.width = innerWidth
		this.canvas.height = innerHeight
	}
	
	// depends on:
	// + this.currVert
	// + VertexIndex
	onwheel(evt) {
		evt.preventDefault()
		
		// ensure ctrl is up, otherwise browser will zoom and
		// cycle through vertices at the same time
		if(!evt.ctrlKey) {
			let delta = Math.sign(evt.deltaY)
			
			// Can't use % bc it can still give a negative number.
			if(delta === -1 && this.currVert.selectedIndex <= 0) {
				this.currVert.selectedIndex = VertexIndex.length - 1;
			}
			else if(delta === +1 && this.currVert.selectedIndex >= VertexIndex.length - 1) {
				this.currVert.selectedIndex = 0;
			}
			else {
				this.currVert.selectedIndex += delta;
			}
			
			// sanity check
			if(this.currVert.selectedIndex === -1) {
				console.debug('did not find vertex in selection menu. did you forget to add it?');
				console.debug('delta: ', delta);
			}
		}
	}
	
	onmousedown(evt) {
		this.mouse.cursor.set_to(evt.clientX, evt.clientY)
		
		// if mouse is not already being dragged, track starting drag location.
		if(! this.mouse.is_dragging) {
			this.mouse._drag_button = evt.button
			this.mouse.drag = this.mouse.cursor.clone()
			this.canvas.addEventListener("mousemove", this.mousemove_handler)
		}
		
		// get vertex under cursor, if any.
		this.selected = this.world.vertexAt(
			this.mouse.cursor.clone().add(this.world.cam)
		);
		
		console.debug(`Clicked at ${this.mouse.cursor} with ${evt.button} button.`)
	}
	
	// If mouse is down and dragged, record position in worldPos.
	// Also handles moving of vertex if one is selected and dragged.
	onmousemove(evt) {
		this.mouse.cursor.set_to(evt.clientX, evt.clientY)
		
		let uaHas = subs => navigator.userAgent.indexOf(subs) !== -1
		
		if(evt.ctrlKey) {
			this.selecting = true
			return
		}
		
		// Helps to differentiate between mouse buttons in different browsers.
		// The reason it works is because the mouseup event for Firefox has the
		// releasing button information in the "buttons" attribute, but Chrome
		// has it on the "button" attribute.
		// XXX maybe not needed anymore?
		//if(uaHas("Firefox") && evt.buttons == 1 || uaHas("Chrome") && evt.button == 0) {
		if(evt.buttons == 1) {
			// if a vertex was selected and it's not the Anchor type,
			if(this.selected && !(this.selected instanceof Vertex.Anchor)) {
				this.selected.pos.offset(evt.movementX, evt.movementY)
			}
			// otherwise, move the camera
			else {
				console.debug('world is moving')
				this.world.cam.offset(-evt.movementX, -evt.movementY)
			}
		}
		// secondary mouse button
		// find connections that intersect with cutting line
		else if(evt.buttons == 2 && this.selected === null) {
			let end = this.mouse.cursor.clone().add(this.world.cam)
			let start = this.mouse.drag.clone().add(this.world.cam)
			this.selectedConnections = this.world.intersectingConnections(start, end)
		}
	}
	
	// TODO FIXME
	// in serious need of factoring somehow.
	onmouseup(evt) {
		if(this.mouse._drag_button == evt.button) {
			this.canvas.removeEventListener("mousemove", this.mousemove_handler);
		}
		
		// left release
		if(evt.button == 0) {
			// remove if there's a vertex and there was no dragging
			//console.log(this.mouse.drag, this.mouse.cursor, this.mouse.is_dragging)
			if(this.selected !== null && !this.mouse.is_dragging) {
				console.debug(`Removing vertex at ${this.selected.pos}`)
				this.world.despawn(this.selected)
			}
		}
		// right release
		else if(evt.button == 2) {
			let worldPos = this.mouse.cursor.clone()
				.add(this.world.cam)
			let next = this.world.vertexAt(worldPos)
			
			// a vertex was present on mousedown and on mouseup
			if(this.selected !== null && next !== null) {
				// run vertex action if they're both the same vertex
				if(this.selected === next) {
					this.selected.action()
				}
				// if they are distinct, connect vertices...
				else {
					// ...by edge
					if(this.currEdge.value === 'edge') {
						let edge = new Edge(this.selected, next)
						this.world.edgeConnect(this.selected, next, edge)
					}
					// ...by arc
					else {
						let arc = new Arc(this.selected, next)
						this.world.arcConnect(this.selected, next, arc)
					}
				}
			}
			// if no vertex selected and mouse was released on blank area,
			else if(this.selected === null && next === null) {
				// ... and mouse wasn't dragged,
				// make new vertex
				if(!this.mouse.is_dragging) {
					//let vertexClass = Vertex.registry.get(this.currVert)
					let vertexClass = VertexMap[this.currVert.value]
					
					if(vertexClass != null) {
						let vertex = new vertexClass(this.world.graph)
						vertex.pos.cloneFrom(worldPos)
						this.world.spawn(vertex)
					}
				}
				// ... and mouse WAS dragged,
				// remove connections that intersect cutting line.
				else {
					let start = this.mouse.cursor.clone().add(this.world.cam)
					let end = this.mouse.drag.clone().add(this.world.cam)
					this.world.disconnectIntersecting(start, end)
					this.selectedConnections = null
				}
			}
		}
		
		// reset EVERYTHING
		this.mouse.reset()
		this.selecting = false
		this.selected = null
	}
	
	onkeydown(evt) {
		if(evt.key == 's') {
			// manually save the world
			this.save()
		}
		else if(evt.key == 'r' && !evt.ctrlKey) {
			if(confirm('You sure you wanna reset your world?')) {
				localStorage['gameData'] = ''
			}
		}
		else if(evt.key == 'z') {
			this.currEdge.value = 'arc'
		}
		else if(evt.key == 'x') {
			this.currEdge.value = 'edge'
		}
		else if(evt.key == 'c') {
			this.autosave = !this.autosave
		}
		else if(evt.key == 't') {
			this.showTutorial()
		}
		else if(evt.key == "Escape") {
			if(this.selectedVertices.size > 0) {
				this.selectedVertices.clear()
			}
			else {
				this.paused = !this.paused
			}
		}
		else if(evt.key == "F3") {
			evt.preventDefault();
			let debug_panel = document.getElementById("debug-panel");
			debugger;
			
			if (debug_panel.style.visibility === "visible") {
				debug_panel.style.visibility = "hidden";
			} else {
				debug_panel.style.visibility = "visible";
			}
			
			this.frameCounter = 0
			this.fps = 0
			this.debug = !this.debug
		}
		else if(evt.key == "Delete") {
			for(let vertex of this.selectedVertices) {
				this.world.despawn(vertex)
			}
			this.selectedVertices.clear()
		}
	}
	
	oncontextmenu(evt) {
		evt.preventDefault()
	}

	drawEdge(begin, end, color) {
		this.ctx.save()
		this.ctx.strokeStyle = color
		this.ctx.beginPath()
			this.ctx.moveTo(...begin)
			this.ctx.lineTo(...end)
		this.ctx.closePath()
		this.ctx.stroke()
		this.ctx.restore()
	}
	
	drawArc(begin, end, color) {
		this.ctx.save()
		//this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
		this.ctx.fillStyle = color
		
		let start_offset = end.clone()
			.sub(begin)
			.rotate(Math.TAU / 4)
			.resize(10)
		
		this.ctx.beginPath()
			this.ctx.moveTo(...start_offset.add(begin))
			this.ctx.lineTo(...end)
			start_offset.sub(begin).reverse()
			this.ctx.lineTo(...start_offset.add(begin))
		this.ctx.closePath()
		this.ctx.fill()
	
		this.ctx.restore()
	}
	
	updateLoop() {
		if(!this.paused) {
			this.world.tick()
		} else {
			alert(`Paused.\nAutosave: ${this.autosave ? 'en' : 'dis'}abled`)
			this.paused = false
		}
	}

	drawLoop(time) {
		requestAnimationFrame(this.drawLoop.bind(this))
	
		this.ctx.strokeStyle = "black"
		this.ctx.lineWidth = 3
		this.ctx.lineCap = "round"
		
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		
		// scratch area
		let from = new Vec2(0, 0)
		let to = new Vec2(0, 0)
		
		// edge drawing procedure
		for(let edge of this.world.graph.edges) {
			let [start, end] = edge.toArray()
			
			from.cloneFrom(start.pos).sub(this.world.cam)
			to.cloneFrom(end.pos).sub(this.world.cam)
		
			// tmp vector to reduce allocations
			let vec = to.clone().sub(from)
		
			// adds offsets from vertex center to its circumference respectively
			vec.resize(start.radius)
			from.add(vec)
			vec.resize(end.radius).reverse()
			to.add(vec)
			
			let color = this.dark_mode ? 'white' : 'black';
			if(this.selectedConnections && this.selectedConnections.has(edge)) {
				color = "red"
			}
		
			// adjust line start and end positions
			this.drawEdge(from, to, color)
		}
	
		// arc drawing procedure
		for(let arc of this.world.graph.arcs) {
			from.cloneFrom(arc.from.pos).sub(this.world.cam)
			to.cloneFrom(arc.to.pos).sub(this.world.cam)
		
			// tmp vector to reduce allocations
			let vec = to.clone().sub(from)
			
			// adds offsets from vertex center to its circumference respectively
			vec.resize(arc.from.radius)
			from.add(vec)
			vec.resize(arc.to.radius).reverse()
			to.add(vec)
			
			let color = this.dark_mode ? 'rgba(255, 255, 255, 0.5)'
				: 'rgba(0, 0, 0, 0.5)';
			if(this.selectedConnections && this.selectedConnections.has(arc)) {
				color = 'rgba(255, 0, 0, 0.5)'
			}
			
			this.drawArc(from, to, color)
		}
	
		// currently creating a connection
		if(this.selected !== null) {
			// TODO draw temporary connection, depending on game state.
		}
		
		// draw red line for cutting connections
		if(this.selected === null && this.mouse._drag_button == 2) {
			this.ctx.save()
			this.ctx.strokeStyle = "red"
			this.ctx.lineCap = "butt"
			this.ctx.setLineDash([5, 5])
			this.ctx.beginPath()
				this.ctx.moveTo(...this.mouse.drag)
				this.ctx.lineTo(...this.mouse.cursor)
			// removing the below line is the only way to prevent the dashed red
			// line from "leaking" to other shapes. don't ask why bc idk.
			//this.ctx.closePath()
			this.ctx.stroke()
			this.ctx.restore()
		}
	
		// vertex drawing procedure
		for(let vertex of this.world.vertices) {
			let pos = vertex.pos.clone().sub(this.world.cam)
			
			this.ctx.save()
			this.ctx.translate(...pos)
			vertex.draw(this.ctx, this.dark_mode);
			this.ctx.strokeStyle = this.dark_mode ? "white" : "black";
			this.ctx.stroke();
			this.ctx.restore()
			
			// draw rotating selection "ring"
			if(this.selectedVertices.has(vertex)) {
				let dt = (time / 100) % Math.TAU
				this.ctx.save()
				this.ctx.lineWidth = 2.5
				this.ctx.lineCap = "butt"
				this.ctx.strokeStyle = 'rgb(255, 255, 0)'
				this.ctx.setLineDash([12.6, 12.6])
				this.ctx.beginPath()
					this.ctx.arc(...pos, vertex.radius, 0 + dt, Math.TAU + dt)
				this.ctx.closePath()
				this.ctx.stroke()
				this.ctx.restore()
			}
		}
		
		// if debug panel is visible, update debug data
		if(this.debug_panel.style.visibility === "visible") {
			// show fps
			let fps_output = document.getElementById("debug-fps");
			this.frameCounter += 1;
			if(time % 1000 < 16.6) {
				fps_output.value = this.frameCounter;
				this.frameCounter = 0;
			}
			
			// show cam coords
			let cam_coords = document.getElementById("debug-cam-coords");
			cam_coords.value = this.world.cam;
		}
	}
}
