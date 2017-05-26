class Edge {
	constructor(a, b) {
		this._a = a
		this._b = b
	}
	
	has(v) {
		return v === this._a || v === this._b
	}
	
	complement(v) {
		if(v === this._a) {
			return this._b
		}
		if(v === this._b) {
			return this._a
		}
		return null
	}
}
