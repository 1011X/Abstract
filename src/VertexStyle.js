class VertexStyle {
	constructor(color, options = {}) {
		this.color = color
		this.border = options.border || "black"
		this.symbol = options.symbol || ""
		this.textColor = options.textColor || "black"
		//this.borderStart = options.borderStart || 0
		//this.borderEnd = options.borderEnd || Math.TAU
	}
	
	toJSON() {
		return {
			color: this.color,
			border: this.border,
			symbol: this.symbol,
			textColor: this.textColor
			//borderStart: this.borderStart
			//borderEnd: this.borderEnd
		}
	}
}
