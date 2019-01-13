Vertex.Switch = class extends Vertex.Base {
	constructor() {
		super()
		this.value = 0
		this.style = new VertexStyle("black", {
            textColor: "white",
            symbol: "⭘"
        })
	}

	action() {
	    switch(this.value) {
	        case 0:  this.value =  1; break
	        case 1:  this.value = -1; break
	        case -1: this.value =  0; break
	        default:
	            throw new Error("switch has invalid value: " + this.value)
	    }
	    this.updateStyle()
	}
	
	update(_) {
		return this.value
	}
	
	updateStyle() {
	    switch(this.value) {
	        case 0:
                this.style.color = "black"
	            this.style.symbol = "⭘"
	            break
	        case 1:
                this.style.color = "white"
	            this.style.symbol = '➕'
	            break
	        case -1:
                this.style.color = "white"
	            this.style.symbol = '➖'
	            break
	        default:
	            throw new Error("switch has invalid value: " + this.value)
	    }
	}
	
	toJSON() {
		let obj = super.toJSON()
		delete obj.style
		return obj
	}
	
	static fromJSON(json) {
		let vertex = super.fromJSON(json)
		vertex.value = json.value
		vertex.updateStyle()
		return vertex
	}
}

Vertex.Switch.prototype.style = new VertexStyle("black", {textColor: "white", symbol: "⏼"})
