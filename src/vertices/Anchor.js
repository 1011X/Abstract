Vertex.Anchor = class extends Vertex.Base {
	update(h) {
	    this.motion.scale(0)
	    return 0
	}
}

Vertex.Anchor.prototype.style = new VertexStyle("lightblue", {
	symbol: "⚓",
	textColor: "white",
})
