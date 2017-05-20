class VertexSwitch extends Vertex {
	constructor(graph) {
		super(graph)
		this.on = false
		this.style = new VertexStyle("black", {textColor: "white", symbol: "S"})
	}

	action() {
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

	update(options) {
		for(let neighbor of this.neighbors) {
			options.send(neighbor, this.on ? Infinity : -Infinity)
		}
	}
}

VertexSwitch.prototype.style = new VertexStyle("black", {textColor: "white", symbol: "S"})
