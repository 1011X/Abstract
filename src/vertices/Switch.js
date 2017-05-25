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

	update(ins, outs) {
		let val = this.on ? Infinity : -Infinity
		for(let i = 0; i < outs.length; i++) {
			outs[i] = val
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
