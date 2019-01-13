Vertex.Switch = class extends Vertex.Base {
	constructor() {
		super()
		this.on = false
		this.style = Vertex.Switch.OFF
	}

	action() {
		this.on = !this.on
		this.updateStyle()
	}
	
	update(_) {
		return this.on ? 1 : -1
	}
	
	updateStyle() {
		this.style = (this.on) ? Vertex.Switch.ON : Vertex.Switch.OFF
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

Vertex.Switch.prototype.style = new VertexStyle("black", {textColor: "white", symbol: "⏼"})
Vertex.Switch.ON = new VertexStyle("white", {symbol: "⏽"})
Vertex.Switch.OFF = new VertexStyle("black", {
    textColor: "white",
    symbol: "⭘"
})
