class VertexFeedback extends Vertex {
	constructor(graph) {
		super()
		this.type = "feedback"
		
		// not really necessary, but for completeness's sake
		this.style.color = "gray"
		this.style.textColor = "black"
		this.style.symbol = "0"
	}

	format(value) {
		if(value === Infinity)
			return "∞"
		else if(value === -Infinity)
			return "-∞"
		else
			return value.toString()
	}

	setColor(value) {
		if(value === Infinity) {
			this.color = "white"
			this.textColor = "black"
		}
		else if(value === -Infinity) {
			this.color = "black"
			this.textColor = "white"
		}
		else {
			this.color = "gray"
			this.textColor = "black"
		}
	}

	update(options) {
		let energy = MathHelper.sum(this.inputs)
		this.setColor(energy)
		this.symbol = this.format(energy)
		this.inputs = []
	}
}

// for when drawing vertex in gui
VertexFeedback.prototype.color = "gray"
VertexFeedback.prototype.textColor = "black"

