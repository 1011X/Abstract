"use strict"

var MathHelper = {
	
	clamp: function(min, val, max){
		return Math.max(min, Math.min(val, max))
	},
	
	sum: function(list){
		var s = 0
		for(var num of list)
			s += num
		return s
	},
}