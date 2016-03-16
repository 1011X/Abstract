class VertexEnergy extends Vertex {
	constructor(graph) {
		this.energy = 1
		this.type = "source"
		
		this.style.color = "yellow"
	}
	
	update(options) {
		for(var neighbor of this.neighbors) {
			options.send(neighbor, 1)
		}
	}
}
