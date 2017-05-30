Vertex.Feedback = class extends Vertex.Base {
	constructor() {
		super()
		this.style = new VertexStyle("darkgray", {
			symbol: "0",
			gradient: VertexStyle.RADIAL_GRADIENT
		})
	}

	format(value) {
		switch(value) {
			case Infinity: return "∞";
			case -Infinity: return "-∞";
			default: return value.toString();
		}
	}

	update(ins, outs) {
		let energy = ins.reduce((acc, val) => acc + val, 0)
		this.style.symbol = this.format(energy)
		
		if(energy === Infinity) {
			this.style.color = "white"
			this.style.textColor = "black"
		}
		else if(energy === -Infinity) {
			this.style.color = "black"
			this.style.textColor = "white"
		}
		else {
			this.style.color = "darkgray"
			this.style.textColor = "black"
		}
	}
}

Vertex.Feedback.prototype.style = new VertexStyle("darkgray", {
	symbol: "0",
	gradient: VertexStyle.RADIAL_GRADIENT
})
