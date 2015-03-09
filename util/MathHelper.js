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
	
	some: function(list, expr){
		for(var elem of list)
			if(expr(elem))
				return true
		return false
	},
	
	all: function(list, expr){
		for(var elem of list)
			if(!expr(elem))
				return false
		return true
	},
	
	maxabs: function(list){
		var max = 0
		var absmax = 0
		for(var num of list)
			if(Math.abs(num) > absmax){
				max = num
				absmax = Math.abs(num)
			}
		return max
	},
	
	minabs: function(list){
		var min = Infinity
		var absmin = Infinity
		for(var num of list)
			if(Math.abs(num) < absmin){
				min = num
				absmin = Math.abs(num)
			}
		return min
	},
}