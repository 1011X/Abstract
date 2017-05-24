Vertex.Switch = class extends Vertex.Base {
	constructor(graph) {
		super(graph)
		this.on = false
		this.style = new VertexStyle("black", {textColor: "white", symbol: "S"})
	}

	action() {
		this.on = !this.on
		this.updateStyle()
	}
	
	updateStyle() {
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
	
	toJSON() {
		let data = super.toJSON()
		data.on = this.on
		data.style = this.style.toJSON()
		return data
	}
}

Vertex.Switch.prototype.style = new VertexStyle("black", {textColor: "white", symbol: "S"})
