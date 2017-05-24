Vertex.Feedback = class extends Vertex.Base {
	constructor(graph) {
		super(graph)
		this.style = new VertexStyle("gray", {textColor: "black", symbol: "0"})
	}

	format(value) {
		switch(value) {
			case Infinity: return "∞";
			case -Infinity: return "-∞";
			default: return value.toString();
		}
	}

	setColor(value) {
		if(value === Infinity) {
			this.style.color = "white"
			this.style.textColor = "black"
		}
		else if(value === -Infinity) {
			this.style.color = "black"
			this.style.textColor = "white"
		}
		else {
			this.style.color = "gray"
			this.style.textColor = "black"
		}
	}

	update(options) {
		let energy = this.inputs.reduce((acc, val) => acc + val, 0)
		this.setColor(energy)
		this.style.symbol = this.format(energy)
		this.inputs = []
	}
}

// for when drawing vertex in gui
Vertex.Feedback.prototype.style = new VertexStyle("gray", {textColor: "black", symbol: "0"})
