Vertex.Sensor = class extends Vertex.Base {
    update(h) {
        let min = 240
        for(let v of h.nearby(240)) {
            let distance = v.pos.clone().sub(this.pos).len
            if(distance <= min) {
                min = distance
            }
        }
        return 1 - Math.floor((min - 48) / 192 * 10) / 10
    }
}

Vertex.Sensor.prototype.style = new VertexStyle("rgb(0, 200, 0)", {symbol: "S"})
