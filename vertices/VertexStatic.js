"use strict"

function VertexStatic(graph){
	Vertex.call(this, graph)
}

VertexStatic.prototype = Object.create(Vertex.prototype)
VertexStatic.prototype.constructor = VertexStatic

VertexStatic.prototype.render = new Render(new Style)