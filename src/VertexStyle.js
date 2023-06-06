class VertexStyle {
	constructor(options = {}) {
		this.bg_color = options.bg_color || "white";
		this.border = options.border || "black"
		this.symbol = options.symbol || ""
		this.textColor = options.textColor || "black"
		this.gradient = options.gradient || VertexStyle.NO_GRADIENT
		//this.borderStart = options.borderStart || 0
		//this.borderEnd = options.borderEnd || Math.TAU
	}
	
	toJSON() {
		let style = {
			bg_color: this.bg_color,
			gradient: this.gradient,
		}
		
		if(this.border !== "black") {
			style.border = this.border
		}
		
		if(this.symbol !== "") {
			style.symbol = this.symbol
		}
		
		if(this.textColor !== "black") {
			style.textColor = this.textColor
		}
		
		return style
	}
	
	static fromJSON(json) {
		let style = new this
		return Object.assign(style, json)
	}
}

VertexStyle.NO_GRADIENT = 0
VertexStyle.LINEAR_GRADIENT = 1
VertexStyle.RADIAL_GRADIENT = 2
