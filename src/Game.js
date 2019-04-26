class Game {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")
        this.world = null
        
        this.selected = null
        // let vectorPool = new ObjectPool(Vec2, 10)
        this.canvasPos = null
        this.prevCanvasPos = null
        this.selectedVertices = new Set
        this.selectedConnections = null
        this.mousemove_handler = null
        this.fps = 0
        this.frameCounter = 0
        
        this.hasDragged = false
        this.paused = false
        this.autosave = false
        this.has_local_storage = true
        this.selecting = false
        this.autosave = false
        this.currVert = 1
        this.currEdge = 0
        
        // test if localStorage is accessible
        try {
            let json = JSON.parse(localStorage['gameData'])
            this.world = World.fromJSON(json.world)
            this.currVert = Vertex.registry.getId(json.currVert)
            this.currEdge = json.currEdge
        }
        catch(e) {
            this.has_local_storage = false
            this.world = new World
            showTutorial()
        }
        
        canvas.addEventListener('wheel', this.onwheel.bind(this))
        canvas.addEventListener('mousedown', this.onmousedown.bind(this))
        canvas.addEventListener('mouseup', this.onmouseup.bind(this))
        canvas.addEventListener('contextmenu', this.oncontextmenu.bind(this))
        window.addEventListener('keydown', this.onkeydown.bind(this))
        window.addEventListener('resize', this.onresize.bind(this))
        this.onresize()

        setInterval(this.updateLoop.bind(this), 50/3)
        setInterval(this.save.bind(this), 60 * 1000)
        requestAnimationFrame(this.drawLoop.bind(this))
    }
    
    save() {
        localStorage["gameData"] = JSON.stringify(this)
    }
    
    // TODO fix
    load(json) {
        this.world = World.fromJSON(json.world)
        this.currVert = Vertex.registry.getId(json.currVert)
        this.currEdge = json.currEdge
    }

    showTutorial() {
        alert(`Controls:\
        T key: show this tutorial\
        S key: manually save the world\
        C key: toggle autosaving (default: enabled)\
        Z key: use arc connections\
        X key: use edge connections`)
        alert(
        `Current selection will be shown in the bottom left corner.\
        Scroll the mouse wheel to select a vertex type.\
        Right click to place a vertex or (in the case of the switch) interact with it.\
        Right click and drag from one vertex to another to connect them.\
        Left click and drag to move a vertex or to pan the world.\
        Left click a vertex to delete it.`)
    }
    
    toJSON() {
        return {
            currVert: Vertex.registry.getName(this.currVert),
            currEdge: this.currEdge,
            world: this.world,
        }
    }
    
    onresize(_) {
        this.canvas.width = innerWidth
        this.canvas.height = innerHeight
    }
    
    onwheel(evt) {
        evt.preventDefault()
        // ensure ctrl is up, otherwise browser will zoom and
        // cycle through vertices at the same time
	    if(!evt.ctrlKey) {
		    let delta = Math.sign(evt.deltaY)
		
		    // skip the vertex type at 0 because it's the "none"
		    // type and we don't want it.
		    if(delta === -1 && this.currVert === 1) {
			    this.currVert = Vertex.registry.size - 1
		    }
		    else if(delta === 1 && this.currVert === Vertex.registry.size - 1) {
			    this.currVert = 1
		    }
		    else {
			    this.currVert += delta
		    }
	    }
    }
    
    onmouseup(evt) {
        this.canvas.removeEventListener("mousemove", this.mousemove_handler)
        this.mousemove_handler = null
        
        // left release
        if(evt.button == 0) {
            // remove if there's a vertex and there was no dragging
            if(this.selected !== null && !this.hasDragged) {
                this.world.despawn(this.selected)
            }
        }
        // right release
        else if(evt.button == 2) {
            let worldPos = this.canvasPos.clone().add(this.world.cam)
            let next = this.world.vertexAt(worldPos)
            
            // a vertex was present on mousedown and on mouseup
            if(this.selected !== null && next !== null) {
                // connect vertices if released on a different vertex
                if(this.selected === next) {
                    this.selected.action()
                }
                else {
                    if(this.currEdge === 0) {
                        let edge = new Edge(this.selected, next)
                        this.world.edgeConnect(this.selected, next, edge)
                    }
                    else {
                        let arc = new Arc(this.selected, next)
                        this.world.arcConnect(this.selected, next, arc)
                    }
                }
            }
            // make new vertex if released in blank area and mouse wasn't dragged
            else if(this.selected === null && next === null && !this.hasDragged) {
                let vertexClass = Vertex.registry.get(this.currVert)
                
                if(vertexClass != null) {
                    let vertex = new vertexClass(this.world.graph)
                    vertex.pos.cloneFrom(worldPos)
                    this.world.spawn(vertex)
                }
            }
        }
        // reset EVERYTHING
        this.hasDragged = false
        this.selected = null
        
        this.prevCanvasPos = null
        this.canvasPos = null
    }
    
    onmousedown(evt) {
        // must save this object locally so it can be passed to
        // `removeEventListener` later. passing `this.onmousemove.bind(this)`
        // won't work because it creates a new, different function.
        this.mousemove_handler = {
            handleEvent: this.onmousemove.bind(this)
        }
        this.canvas.addEventListener("mousemove", this.mousemove_handler)

        // determine if we want to draw a selection box or do something else.
        if(evt.ctrlKey) {
            this.prevCanvasPos = new Vec2(evt.clientX, evt.clientY)
        }
        else {
            this.canvasPos = new Vec2(evt.clientX, evt.clientY)
            let worldPos = this.canvasPos.clone().add(this.world.cam)
            this.selected = this.world.vertexAt(worldPos)
            
            if(this.selected === null) {
                this.prevCanvasPos = new Vec2(evt.clientX, evt.clientY)
                let prevWorldPos = this.prevCanvasPos.clone().add(this.world.cam)
                let worldPos = this.canvasPos.clone().add(this.world.cam)
                this.selectedConnections = this.world.intersectingConnections(prevWorldPos, worldPos)
            }
        }
    }
    
    // If mouse is down and dragged, record position in worldPos.
    // Also handles moving of vertex if one is selected and dragged.
    onmousemove(evt) {
        let uaHas = subs => navigator.userAgent.indexOf(subs) !== -1
        this.hasDragged = true
        
        if(evt.ctrlKey) {
            this.selecting = true
            this.canvasPos = new Vec2(evt.pageX, evt.pageY)
        }
        else {
            // Helps to differentiate between mouse buttons in different browsers.
            // The reason it works is because the mouseup event for Firefox has the
            // releasing button information in the "buttons" attribute, but Chrome
            // has it on the "button" attribute.
            // XXX maybe not needed anymore?
            //if(uaHas("Firefox") && evt.buttons == 1 || uaHas("Chrome") && evt.button == 0) {
            if(evt.buttons == 1) {
                this.prevCanvasPos = this.canvasPos
                this.canvasPos = new Vec2(evt.clientX, evt.clientY)
                let worldPos = this.canvasPos.clone().add(this.world.cam)
                
                // if a vertex was selected,
                // then move it according to the cursor's movement.
                if(this.selected !== null) {
                    // ensure it's not the Anchor type
                    if(!(this.selected instanceof Vertex.Anchor)) {
                        this.selected.pos.cloneFrom(worldPos)
                    }
                }
                // otherwise, move the camera
                else {
                    this.world.cam.x -= evt.movementX
                    this.world.cam.y -= evt.movementY
                }
            }
            // right mouse button
            else if(evt.buttons == 2) {
                this.canvasPos = new Vec2(evt.clientX, evt.clientY)
                //let worldPos = canvasPos.clone().add(world.cam)
            }
        }
    }
    
    onkeydown(evt) {
        if(evt.key === 's') { // s
            // manually save the world
            this.save()
        }
        else if(evt.key === 'e') {
            // toggle current connection type
            if(this.currEdge === 0) {
                this.currEdge = 1
            }
            else {
                this.currEdge = 0
            }
        }
        else if(evt.key === 'z') {
            this.currEdge = 1
        }
        else if(evt.key === 'x') {
            this.currEdge = 0
        }
        else if(evt.key === 'c') {
            this.autosave = !this.autosave
        }
        else if(evt.key === 't') {
            this.showTutorial()
        }
        else if(evt.key === "Escape") {
            if(this.selectedVertices.size > 0) {
                this.selectedVertices.clear()
            }
            else {
                this.paused = !this.paused
            }
        }
        else if(evt.key === "F3") {
            evt.preventDefault()
            this.frameCounter = 0
            this.fps = 0
            this.debug = !this.debug
        }
        else if(evt.key === "Delete") {
            if(this.selectedVertices.size > 0) {
                for(let vertex of this.selectedVertices) {
                    this.world.despawn(vertex)
                }
                this.selectedVertices.clear()
            }
        }
    }
    
    oncontextmenu(evt) {
        evt.preventDefault()
    }

    drawVertex(pos, radius, style) {
	    this.ctx.save()
	
	    if(style.gradient === VertexStyle.RADIAL_GRADIENT) {
		    let radialGradient = this.ctx.createRadialGradient(...pos, 0, ...pos, radius)
		
		    radialGradient.addColorStop(0, "white")
		    radialGradient.addColorStop(1, style.color)

		    this.ctx.fillStyle = radialGradient
	    }
	    else {
		    this.ctx.fillStyle = style.color
	    }

	    this.ctx.strokeStyle = style.border

	    this.ctx.beginPath()
	    this.ctx.arc(...pos, radius, 0, Math.TAU)
	    this.ctx.closePath()
	    this.ctx.fill()
	    this.ctx.stroke()

	    if(style.symbol) {
		    this.ctx.fillStyle = style.textColor
		    this.ctx.textAlign = "center"
		    this.ctx.textBaseline = "middle"
		    this.ctx.font = "bold 20px serif"
		    this.ctx.fillText(style.symbol, ...pos)
	    }
	
	    this.ctx.restore()
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
	        alert(`Paused.\nAutosave: ${this.autosave ? 'enabled' : 'disabled'}`)
	        this.paused = false
	    }
    }

    drawLoop() {
	    requestAnimationFrame(this.drawLoop.bind(this))
	
	    this.ctx.strokeStyle = "black"
	    this.ctx.lineWidth = 3
	    this.ctx.lineCap = "round"
	    
	    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	    
	    // edge drawing procedure
	    for(let edge of this.world.graph.edges) {
		    edge = edge.toArray()
		
		    let from = edge[0].pos.clone()
			    .sub(this.world.cam)
		
		    let to = edge[1].pos.clone()
			    .sub(this.world.cam)
		
		    // tmp vector to reduce allocations
		    let vec = to.clone().sub(from)
		
	        // adds offsets from vertex center to its circumference respectively
	        vec.resize(edge[0].radius)
            from.add(vec)
            vec.resize(edge[1].radius).reverse()
            to.add(vec)
            
            let color = this.selectedConnections !== null && this.selectedConnections.has(edge) ?
                "red" : "black"
		
		    // adjust line start and end positions
		    this.drawEdge(from, to, color)
	    }
	
	    // arc drawing procedure
	    for(let arc of this.world.graph.arcs) {
		    let from = arc.from.pos.clone()
			    .sub(this.world.cam)
		
		    let to = arc.to.pos.clone()
			    .sub(this.world.cam)
		
		    // tmp vector to reduce allocations
		    let vec = to.clone().sub(from)
	        
	        // adds offsets from vertex center to its circumference respectively
	        vec.resize(arc.from.radius)
            from.add(vec)
            vec.resize(arc.to.radius).reverse()
            to.add(vec)
            
            let color = this.selectedConnections !== null && this.selectedConnections.has(arc) ?
                'rgba(255, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.5)'
            
		    this.drawArc(from, to, color)
	    }
	
	    // currently creating a connection
	    if(this.selected !== null) {
	        // TODO dynamically draw temporal connection, depending on game state.
        }
        
        if(this.selected === null && this.hasDragged) {
            // draw red line for cutting connections
            this.ctx.save()
            this.ctx.strokeStyle = "red"
            this.ctx.beginPath()
                this.ctx.moveTo(...this.prevCanvasPos)
                this.ctx.lineTo(...this.canvasPos)
            this.ctx.closePath()
            this.ctx.stroke()
            this.ctx.restore()
        }
	
	    // vertex drawing procedure
	    for(let vertex of this.world.vertices) {
		    // get position relative to canvas
		    let pos = vertex.pos.clone().sub(this.world.cam)
		
		    // if inside the selection box, put in selectedVertices
		    if(this.selecting) {
		        let inside = this.prevCanvasPos.x < pos.x && pos.x < this.canvasPos.x
		            && this.prevCanvasPos.y < pos.y && pos.y < this.canvasPos.y
	            if(inside) {
	                this.selectedVertices.add(vertex)
	            }
	            else {
	                this.selectedVertices.delete(vertex)
	            }
		    }
		
		    this.drawVertex(pos, vertex.radius, vertex.style)
		
		    // draw rotating selection "ring"
		    if(this.selectedVertices.has(vertex)) {
		        let dt = (time / 1000) % Math.TAU
		        this.ctx.save()
		        this.ctx.lineWidth = 2.5
            	this.ctx.lineCap = "butt"
		        this.ctx.strokeStyle = 'rgb(255, 255, 0)'
		        this.ctx.setLineDash([15, 15])
		        this.ctx.beginPath()
		        this.ctx.arc(...pos, vertex.radius, 0 + dt, Math.TAU + dt)
		        this.ctx.closePath()
		        this.ctx.stroke()
		        this.ctx.restore()
		    }
	    }
	
	
	    // draw selection box
	    if(this.selecting) {
	        this.ctx.save()
	        
	        this.ctx.fillStyle = 'rgba(230, 230, 0, 0.4)'
	        this.ctx.strokeStyle = 'yellow'
	        let rectSize = canvasPos.clone().sub(this.prevCanvasPos)
	        
	        this.ctx.fillRect(...this.prevCanvasPos, ...rectSize)
	        this.ctx.strokeRect(...this.prevCanvasPos, ...rectSize)
	        
	        this.ctx.restore()
	    }
	
	
	    // draw UI/current selection
	    let pos = new Vec2(10, innerHeight - 10)
	
	    let strings = [
	        `vertex: ${Vertex.registry.getName(this.currVert)}`,
	        `connection: ${this.currEdge ? 'arc' : 'edge'}`,
        ]
	
	    this.ctx.font = "18px sans-serif"
	
	    for(let str of strings.reverse()) {
        	this.ctx.fillText(str, ...pos)
	        pos.y -= 18
        }
	
	
	    if(this.debug) {
		    this.frameCounter += 1
		    if(time % 1000 < 16.6) {
			    this.fps = this.frameCounter
			    this.frameCounter = 0
		    }
		
		    this.ctx.save()
		    this.ctx.textBaseline = "top"
		    this.ctx.fillText(`FPS: ${fps}`, 10, 10)
		    this.ctx.restore()
	    }
    }
}
