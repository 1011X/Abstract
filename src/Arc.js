class Arc {
	constructor(from, to) {
		this.from = from
		this.to = to
		this.weight = 1
		this.delay = 1
	}
	
	toJSON() {
		return {
			weight: this.weight,
			delay: this.delay
		}
	}
}
