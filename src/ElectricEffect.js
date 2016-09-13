class ElectricEffect {
	constructor(origin, dest, color = "white") {
		// source typeof Vec2, dest typeof Vec2, color typeof color string
		this.segments = this.createBolt(origin, dest)
		this.origin = origin
		this.thickness = 2

		this.alpha = 1
		this.fadeoutRate = 0.07
		this.color = color
	}

	draw(c) {
		c.lineCap = "round"
		c.lineWidth = this.thickness
		c.globalAlpha = this.alpha
		c.strokeStyle = this.color
		c.shadowColor = this.color
		
		c.beginPath()
		c.moveTo(...this.origin)
		for(let segment of this.segments)
			c.lineTo(...segment)
		c.closePath()
		
		c.stroke()
	}

	update(field) {
		if(this.alpha <= 0.07) {
			// to prevent flash on end
			field.remove(this)
			return
		}
		
		this.alpha -= this.fadeoutRate
	}

	createBolt(source, destination) {
		// source typeof Vec2, dest typeof Vec2
		let results = [];
		let tangent = new Vec2(...destination).subtract(source)
		let normal = new Vec2(tangent.y, -tangent.x).normalize()

		let positions = [0]

		let len = tangent.length
		for(let i = 0; i < len / 6; i++)
			positions.push(Math.random())

		positions.sort((a, b) => a - b)

		let sway = 80
		let jaggedness = 1 / sway

		let previousPoint = source
		let previousDisplacement = 0
		for(let i = 1; i < positions.length; i++) {
			let position = positions[i]

			// used to prevent sharp angles by ensuring very close positions
			// also have small perpendicular letiation.
			let scale = length * jaggedness * (position - positions[i - 1])

			// defines an envelope. Points near the middle of the bolt can be
			// further from the central line.
			let envelope = position > 0.95 ? 20 * (1 - position) : 1

			let displacement = (Math.round(Math.random()) ? 1 : -1) * Math.random() * sway
			displacement -= (displacement - previousDisplacement) * (1 - scale)
			displacement *= envelope

			let point = new Vec2(...source)
				.add(new Vec2(...tangent).scale(position))
				.add(new Vec2(...normal).scale(displacement))
			results.push(point)
			previousPoint = point
			previousDisplacement = displacement
		}
		
		results.push(destination)

		return results
	}
}
