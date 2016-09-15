class VertexNOR extends Vertex {
	constructor(graph) {
		super()
		this.type = "nor"
		
		this.style.symbol = "N"
		this.style.color = "skyblue"
	}

	update(options) {
		for(var neighbor of this.neighbors)
			if(!this.energy)
				options.send(neighbor, 1)
		
		this.energy = 0
	}
}
