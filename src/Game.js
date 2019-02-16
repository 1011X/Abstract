class Game {
    constructor(canvas) {
        this.canvas = canvas
        
        this.paused = false
        this.autosave = false
        this.mouse = new Mouse
        this.keyboard = new Keyboard
        this.currVert = 1
        this.currEdge = 0
    }
    
    resize_handler(_) {
	    this.canvas.width = innerWidth
	    this.canvas.height = innerHeight
    }
    
    mouse_wheel_handler() {}
    mouse_up_handler() {}
    mouse_down_handler() {}
    mouse_move_handler() {}
    
    key_up_handler() {}
    key_down_handler() {}
    
}
