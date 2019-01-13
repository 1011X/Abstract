Vertex.Feedback = class extends Vertex.Base {
	constructor() {
		super()
		this.style = new VertexStyle("gray", {
		    symbol: "0",
        	gradient: VertexStyle.RADIAL_GRADIENT
    	})
	}

	format(value) {
		switch(value) {
			case Infinity: return "∞";
			case -Infinity: return "-∞";
			default: return parseFloat(value.toFixed(1)).toString();
		}
	}

	update(h) {
		let energy = h.inputs.reduce((acc, val) => acc + val, 0)
		let val = this.format(energy)
		
		if(val === this.style.symbol) {
		    return 0
		}
		
		h.needsUpdate = true
		this.style.symbol = val
		
		if(energy > 0) {
			this.style.color = "cyan"
		}
		else if(energy < 0) {
			this.style.color = "red"
		}
		else {
			this.style.color = "gray"
		}
		
		return 0
	}
}

Vertex.Feedback.prototype.style = new VertexStyle("white", {symbol: "F"})
