class Game {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")
        this.world = null
        
        this.selected = null
        // let vectorPool = new ObjectPool(Vec2, 10)
        this.canvasPos = null
        this.prevCanvasPos = null
        
        this.hasDragged = false
        this.paused = false
        this.autosave = false
        this.mouse = new Mouse
        this.keyboard = new Keyboard
        this.currVert = 1
        this.currEdge = 0
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
    
    toJSON() {
        return {
            currVert: Vertex.registry.getName(this.currVert),
            currEdge: this.currEdge,
            world: this.world,
        }
    }
    
    resize_handler(_) {
        this.canvas.width = innerWidth
        this.canvas.height = innerHeight
    }
    
    mouse_wheel_handler(evt) {
        // ensure ctrl is up, otherwise browser will zoom and
        // cycle through vertices at the same time
        if(!evt.ctrlKey) {
            this.currVert += Math.sign(evt.deltaY)
            this.currVert %= Vertex.registry.size
        
            if(this.currVert < 0) {
                this.currVert += Vertex.registry.size
            }
        }
    }
    
    mouse_up_handler() {
        this.canvas.removeEventListener("mousemove", this.dragAction)
        
        // left release
        if(evt.button == 0) {
            // remove if there's a vertex and there was no dragging
            if(this.selected !== null && !this.hasDragged) {
                this.world.despawn(selected)
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
    
    mouse_down_handler(evt) {
        this.canvas.addEventListener("mousemove", dragAction)
        
        this.canvasPos = new Vec2(evt.pageX, evt.pageY)
        let worldPos = this.canvasPos.clone().add(this.world.cam)
        
        this.selected = this.world.vertexAt(worldPos)
    }
    
    // If mouse is down and dragged, record position in worldPos.
    // Also handles moving of vertex if one is selected and dragged.
    mouse_move_handler() {
        let uaHas = subs => navigator.userAgent.indexOf(subs) !== -1
        this.hasDragged = true
        
        this.prevCanvasPos = this.canvasPos
        
        this.canvasPos = new Vec2(evt.pageX, evt.pageY)
        let worldPos = this.canvasPos.clone().add(this.world.cam)
        
        // Helps to differentiate between mouse buttons in different browsers.
        // The reason it works is because the mouseup event for Firefox has the
        // releasing button information in the "buttons" attribute, but Chrome
        // has it on the "button" attribute.
        if(uaHas("Firefox") && evt.buttons == 1
        || uaHas("Chrome") && evt.button == 0) {
            // if a vertex was selected and it wasn't moving,
            // then move it according to the cursor's movement.
            if(this.selected !== null && this.selected.motion.isNull()) {
                // ensure it's not the Anchor type
                if(!(this.selected instanceof Vertex.Anchor)) {
                    this.selected.pos.cloneFrom(worldPos)
                }
            }
            else {
                let canvasMovement = this.canvasPos.clone()
                    .sub(this.prevCanvasPos)
                    .reverse()
                this.world.cam.add(canvasMovement)
            }
        }
    }
    
    key_down_handler(evt) {
        // 's' is pressed
        if(evt.keyCode == 83) {
            save()
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
    }
    
    context_menu_handler(evt) {
        evt.preventDefault()
    }
}





function drawVertex(pos, radius, style) {
    ctx.save()

    if(style.gradient === VertexStyle.RADIAL_GRADIENT) {
        let radialGradient = ctx.createRadialGradient(...pos, 0, ...pos, radius)
    
        if(style.textColor === "white") {
            radialGradient.addColorStop(0, "black")
            radialGradient.addColorStop(1, style.color)
        }
        else {
            radialGradient.addColorStop(0, "white")
            radialGradient.addColorStop(1, style.color)
        }

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
        ctx.font = "bold 18px sans-serif"
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

function drawArc(begin, end, opp_head = false) {
    // draw dashed line
    ctx.beginPath()
    ctx.setLineDash([15, 15])
    ctx.moveTo(...begin)
    ctx.lineTo(...end)
    ctx.stroke()
    
    let angle = Math.TAU / 12
    let line = begin.clone().sub(end)
    let tip = line.clone()
        .resize(16)
        .rotate(angle)
        .add(end)
    
    // draw arrowhead
    ctx.beginPath()
    ctx.setLineDash([])
    ctx.moveTo(...end)
    ctx.lineTo(...tip)
    ctx.moveTo(...end)
    
    tip.sub(end)
        .rotate(-2 * angle)
        .add(end)
    
    ctx.lineTo(...tip)
    ctx.moveTo(...end)
    
    // draw back arrowhead if told to
    if(opp_head) {
        line.reverse()
        tip.cloneFrom(line)
        tip.resize(16)
            .rotate(angle)
            .add(start)
        
        ctx.beginPath()
        ctx.moveTo(...start)
        ctx.lineTo(...tip)
        ctx.moveTo(...start)
        
        tip.sub(start)
            .rotate(-2 * angle)
            .add(start)
        
        ctx.lineTo(...tip)
        ctx.moveTo(...end)
    }
    
    ctx.closePath()
    ctx.stroke()
}


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
        drawEdge(from.add(fromOffset), to.add(toOffset))
    }
    
    // arc drawing procedure
    let alreadyDrawn = new Set
    for(let arc of world.graph.arcs) {
        let has_opposite = world.graph.getArc(arc.to, arc.from) !== null
        
        if(alreadyDrawn.has(arc) || has_opposite) {
            continue
        }
        
        let from = arc.from.pos.clone()
            .sub(world.cam)
        
        let to = arc.to.pos.clone()
            .sub(world.cam)
        
        // get offset from center of vertex to its edge
        let fromOffset = to.clone()
            .sub(from)
            .resize(arc.from.radius)
        
        let toOffset = from.clone()
            .sub(to)
            .resize(arc.to.radius)
        
        drawArc(
            from.add(fromOffset),
            to.add(toOffset),
            has_opposite
        )
        
        alreadyDrawn.add(arc)
    }
    
    // vertex drawing procedure
    for(let vertex of world.vertices) {
        // get position relative to canvas
        let pos = vertex.pos.clone().sub(world.cam)
        drawVertex(pos, vertex.radius, vertex.style)
    }
    
    ctx.save()
    
    // draw UI
    let vertexClass = Vertex.registry.get(currVert)
    
    let {style, radius} = vertexClass.prototype
    let pos = new Vec2(
        /*world.RAD*/ 20 + 10,
        innerHeight - /*world.RAD*/ 20 - 10
    )
    
    drawVertex(pos, radius, style)
    
    let start = new Vec2(10 + 2 * 20 + 10, innerHeight - 13)
    let end = start.clone().add([33, -33])
    
    if(currEdge === 0) {
        drawEdge(start, end)
    }
    else {
        drawArc(start, end, false)
    }
}

setInterval(updateLoop, 50/3)
setInterval(save, 60 * 1000)
requestAnimationFrame(drawLoop)
