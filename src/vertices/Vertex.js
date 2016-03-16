class Vertex {
	constructor(graph) {
		this.pos = [0, 0]
		this.motion = [0, 0]
		this.inputs = []
	
		this.graph = graph
	
		this.style = {
			type: "blank",
	
			icon: null,
			symbol: "",
			color: "white",
			textColor: "black",
			border: "black",
			// borderStart: 0,
			// borderEnd: 2 * Math.PI,
		}
	}
	
	get neighbors(){
		return this.graph.neighbors(this)
	}
	
	update() {}
	
	action() {}
	
	toJSON() {
		return {
			type: this.type,
			pos: this.pos,
			motion: this.motion,
			inputs: this.inputs,
		}
	}
}
