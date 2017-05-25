Vertex.Feedback = class extends Vertex.Base {
	constructor(graph) {
		super(graph)
		this.style = new VertexStyle("darkgray", {symbol: "0"})
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
			this.style.color = "darkgray"
			this.style.textColor = "black"
		}
	}

	update(ins, outs) {
		let energy = ins.reduce((acc, val) => acc + val, 0)
		this.setColor(energy)
		this.style.symbol = this.format(energy)
	}
}

Vertex.Feedback.prototype.style = new VertexStyle("darkgray", {symbol: "0"})
