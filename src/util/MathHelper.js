"use strict"

class MathHelper {
	
	static clamp(min, val, max) {
		return Math.max(min, Math.min(val, max))
	}
	
	static sum(list) {
		let s = 0
		for(let num of list)
			s += num
		return s
	}
}
