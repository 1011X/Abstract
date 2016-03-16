var ElectricEffect = function(origin, dest, color){
	// source, dest typeof Vector, color typeof style
	this.segments = this.createBolt(origin, dest);
	this.origin = origin;
	this.thickness = 2;

	this.alpha = 1;
	this.fadeoutRate = 0.07;
	this.color = color || "white";
};

ElectricEffect.prototype.draw = function(c){
	c.lineCap = "round";
	c.lineWidth = this.thickness;
	c.globalAlpha = this.alpha;
	c.strokeStyle = this.color;
	c.shadowColor = this.color;
	c.beginPath();
	c.moveTo(this.origin.x, this.origin.y);
	for(var i = 0; i < this.segments.length; i++)
		c.lineTo(this.segments[i].x, this.segments[i].y);
	c.stroke();
};

ElectricEffect.prototype.update = function(field){
	if(this.alpha <= 0.07){
		// to prevent flash on end
		field.remove(this);
		return;
	}
	this.alpha -= this.fadeoutRate;
};

ElectricEffect.prototype.createBolt = function(source, destination){
	// source, dest typeof Vector2, thickness typeof number
	var results = [];
	var tangent = Vector.subtract(destination, source);
	var normal = new Vector(tangent.y, -tangent.x).normalize();

	var positions = [];
	positions.push(0);

	var length = tangent.magnitude();
	for(var i = 0; i < length / 6; i++)
		positions.push(Math.random());

	positions.sort(function(a, b){
		return a - b;
	});

	var sway = 80;
	var jaggedness = 1 / sway;

	var previousPoint = source;
	var previousDisplacement = 0;
	for (i = 1; i < positions.length; i++){
		var position = positions[i];

		// used to prevent sharp angles by ensuring very close positions also have small perpendicular variation.
		var scale = length * jaggedness * (position - positions[i - 1]);

		// defines an envelope. Points near the middle of the bolt can be further from the central line.
		var envelope = position > 0.95 ? 20 * (1 - position) : 1;

		var displacement = (Math.round(Math.random()) ? 1 : -1) * Math.random() * sway;
		displacement -= (displacement - previousDisplacement) * (1 - scale);
		displacement *= envelope;

		var point = Vector.sum(source, Vector.scale(tangent, position), Vector.scale(normal, displacement));
		results.push(point);
		previousPoint = point;
		previousDisplacement = displacement;
	}
	results.push(destination);

	return results;
};