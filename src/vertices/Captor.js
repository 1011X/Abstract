Vertex.Captor = class Captor extends Vertex.Base {
    update(h) {
        for(let v of h.nearby(120)) {
            h.arcConnectFrom(v)
        }
        return h.inputs.reduce((a, c) => a + c, 0)
    }
}

Vertex.Captor.prototype.style = new VertexStyle("green")
