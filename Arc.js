"use strict"

function Arc(from, to){
	this.from = from
	this.to = to
	this.weight = 1
	this.delay = 1
}

Arc.prototype = {
	
	toJSON: function(){
		return {
			weight: this.weight,
			delay: this.delay
		}
	},
}