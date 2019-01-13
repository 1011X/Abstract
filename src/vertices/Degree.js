Vertex.Degree = class extends Vertex.Base {
    constructor() {
        super()
        this.style = new VertexStyle("white", {symbol: "0"})
    }
    
    update(h) {
        let degree = h.neighbors.length
        this.style.symbol = degree.toString()
        return degree
    }
}

Vertex.Degree.prototype.style = new VertexStyle("white", {symbol: "deg"})
