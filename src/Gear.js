class Gear {
	constructor(s, outerRadius, teeth, speed) {
		this.s = s
		this.outerRadius = outerRadius
		this.innerRadius = 4 * outerRadius / 5
		this.teeth = teeth
		this.theta = 0
		this.speed = Math.TAU / 60 * speed
		if(this.speed >= Math.TAU)
			this.speed -= Math.round(this.speed / Math.TAU) * Math.TAU

		this.connections = []
	}

	draw(c) {
		c.fillStyle = "darkgray"
		c.strokeStyle = "black"
		/*
		function draw(teeth, depth, radius, width, line){
			var x = canvas.width / 2;
			var y = canvas.height / 2;
			var lastEnd = 0;

			depth = (radius / 100) * depth;

			c.beginPath();
			for(var i = 0; i <= teeth * 2; i++){
				var diff = (100 - width) / 200 * arcToRad(teeth);
				var newEnd = lastEnd + arcToRad(teeth);

				var start = lastEnd + diff;
				var end = newEnd - diff;

				if(i % 2 === 0)
					c.arc(x, y, radius, start, end, false);
				else
					c.arc(x, y, radius - depth, start, end, false);
				lastEnd = newEnd;
			}
			c.strokeStyle = 'black';
			c.lineWidth = line;
			c.stroke();
		}
		*/
		let sectionArc = Math.TAU / this.teeth
		c.beginPath()
		
		for(let i = 0; i < this.teeth; ++i) {
			// switches back and forth between drawing the furthest radius (what makes the "teeth"), and the
			// innermost radius (the gaps between the teeth).
			c.arc(...this.s, this.outerRadius, sectionArc * i + this.theta, sectionArc * (i + 0.5) + this.theta)
			c.arc(...this.s, this.innerRadius, sectionArc * (i + 0.5) + this.theta, sectionArc * (i + 1) + this.theta)
		}
		
		c.closePath()
		c.fill()
		c.stroke()
	}

	update(field) {
		this.theta += this.speed
		
		if(this.theta >= Math.TAU)
			this.theta -= Math.floor(this.theta / Math.TAU) * Math.TAU
	}
}
