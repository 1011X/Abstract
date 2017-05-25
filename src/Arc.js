class Arc {
	constructor(from, to) {
		this.from = from
		this.to = to
		this.value = 0
	}
	
	toJSON() {
		return {
			value: this.value
		}
	}
}
