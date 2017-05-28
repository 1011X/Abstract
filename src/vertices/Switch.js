Vertex.Switch = class extends Vertex.Base {
	constructor() {
		super()
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
	
	update(ins, outs) {
		let val = this.on ? Infinity : -Infinity
		for(let i = 0; i < outs.length; i++) {
			outs[i] = val
		}
	}
	
	static fromJSON(json) {
		let vertex = super.fromJSON(json)
		vertex.on = json.on
		vertex.style = VertexStyle.fromJSON(json.style)
		return vertex
	}
}

Vertex.Switch.prototype.style = new VertexStyle("black", {textColor: "white", symbol: "S"})
