class VertexNOR extends Vertex {
	constructor(graph) {
		super(graph)
		this.energy = 0
	}

	update(options) {
		for(let neighbor of this.neighbors) {
			if(!this.energy) {
				options.send(neighbor, 1)
			}
		}
		
		this.energy = 0
	}
}

VertexNOR.prototype.style = new VertexStyle("skyblue", {symbol: "N"})
