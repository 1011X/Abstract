class VertexEnergy extends Vertex {
	constructor(graph) {
		super(graph)
		this.energy = 1
	}
	
	update(options) {
		for(let neighbor of this.neighbors) {
			options.send(neighbor, 1)
		}
	}
}

VertexEnergy.prototype.style = new VertexStyle("yellow")
