class VecPool {
	constructor(size = 0) {
		this.pool = new Set
	
		for(let i = 0; i < size; ++i)
			this.pool.add(new Vec2)
		
		this.available = new WeakSet(this.pool)
	}
	
	capacity() {
		return this.pool.size
	}
	
	request() {
		for(let vec of this.pool)
			if(this.available.has(vec)) {
				this.available.delete(vec)
				return vec
			}
		
		// no vecs available, so grow
		_grow()
		
		for(let vec of this.pool)
			if(this.available.has(vec)) {
				this.available.delete(vec)
				return vec
			}
	}
	
	// assumes vec is a Vec2 and in the pool
	return(vec) {
		this.available.add(vec)
	}
	
	_grow() {
		let newCap = this.capacity + 1
		for(let i = 0; i < newCap; i++) {
			let vec = new Vec2
			this.pool.add(vec)
			this.available.add(vec)
		}
	}
	
	shrinkToFit() {
		for(let vec of this.pool)
			if(this.available.has(vec))
				this.pool.delete(vec)
	}
}
