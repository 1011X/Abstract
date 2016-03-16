class VertexSwitch extends Vertex {
	constructor(graph) {
		this.type = "switch"
		this.on = false
		
		this.style.color = "black"
		this.style.textColor = "white"
		this.style.symbol = "S"
	}

	toggle() {
		this.on = !this.on
	
		if(this.on) {
			this.style.color = "white"
			this.style.textColor = "black"
		}
		else {
			this.style.color = "black"
			this.style.textColor = "white"
		}
	}
	
	action() {
		this.toggle()
	}

	update(options) {
		for(var neighbor of this.neighbors) {
			options.send(neighbor, this.on ? Infinity : -Infinity)
		}
	}
}
