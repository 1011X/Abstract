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
		let style = {color: this.color}
		
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
		style.color = json.color
		for(let prop in json) {
			style[prop] = json[prop]
		}
		return style
	}
}
