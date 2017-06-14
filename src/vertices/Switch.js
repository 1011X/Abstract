Vertex.Switch = class extends Vertex.Base {
	constructor() {
		super()
		this.on = false
		this.style = new VertexStyle("black", {textColor: "white", symbol: "O"})
	}

	action() {
		this.on = !this.on
		this.updateStyle()
	}
	
	update(ins, outs) {
		let val = this.on ? Infinity : -Infinity
		for(let i = 0; i < outs.length; i++) {
			outs[i] = val
		}
	}
	
	updateStyle() {
		if(this.on) {
			this.style.symbol = "|"
			this.style.color = "white"
			this.style.textColor = "black"
		}
		else {
			this.style.symbol = "O"
			this.style.color = "black"
			this.style.textColor = "white"
		}
	}
	
	toJSON() {
		let obj = super.toJSON()
		delete obj.style
		return obj
	}
	
	static fromJSON(json) {
		let vertex = super.fromJSON(json)
		vertex.on = json.on
		vertex.updateStyle()
		return vertex
	}
}

Vertex.Switch.prototype.style = new VertexStyle("black", {textColor: "white", symbol: "S"})
