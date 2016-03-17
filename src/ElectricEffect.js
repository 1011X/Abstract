class ElectricEffect {
	constructor(origin, dest, color) {
		// source, dest typeof Vector, color typeof style
		this.segments = this.createBolt(origin, dest);
		this.origin = origin;
		this.thickness = 2;

		this.alpha = 1;
		this.fadeoutRate = 0.07;
		this.color = color || "white";
	}

	draw(c) {
		c.lineCap = "round";
		c.lineWidth = this.thickness;
		c.globalAlpha = this.alpha;
		c.strokeStyle = this.color;
		c.shadowColor = this.color;
		c.beginPath();
		c.moveTo(this.origin.x, this.origin.y);
		for(let i = 0; i < this.segments.length; i++)
			c.lineTo(this.segments[i].x, this.segments[i].y);
		c.stroke();
	}

	update(field) {
		if(this.alpha <= 0.07){
			// to prevent flash on end
			field.remove(this);
			return;
		}
		this.alpha -= this.fadeoutRate;
	}

	createBolt(source, destination) {
		// source, dest typeof Vector2, thickness typeof number
		let results = [];
		let tangent = Vector.subtract(destination, source);
		let normal = new Vector(tangent.y, -tangent.x).normalize();

		let positions = [];
		positions.push(0);

		let length = tangent.magnitude();
		for(let i = 0; i < length / 6; i++)
			positions.push(Math.random());

		positions.sort(function(a, b){
			return a - b;
		});

		let sway = 80;
		let jaggedness = 1 / sway;

		let previousPoint = source;
		let previousDisplacement = 0;
		for (i = 1; i < positions.length; i++){
			let position = positions[i];

			// used to prevent sharp angles by ensuring very close positions also have small perpendicular letiation.
			let scale = length * jaggedness * (position - positions[i - 1]);

			// defines an envelope. Points near the middle of the bolt can be further from the central line.
			let envelope = position > 0.95 ? 20 * (1 - position) : 1;

			let displacement = (Math.round(Math.random()) ? 1 : -1) * Math.random() * sway;
			displacement -= (displacement - previousDisplacement) * (1 - scale);
			displacement *= envelope;

			let point = Vector.sum(source, Vector.scale(tangent, position), Vector.scale(normal, displacement));
			results.push(point);
			previousPoint = point;
			previousDisplacement = displacement;
		}
		results.push(destination);

		return results;
	}
}
