class ObjectPool {
	constructor(objType, number) {
		this.objType = objType
		this.available = new WeakSet
		this.pool = new Set
	
		for(let i = 0; i < number; ++i)
			this._create()
	}
	
	get size() {
		return this.pool.length
	}
	
	_create() {
		let obj = new this.objType
		this.pool.add(obj)
		this.available.add(obj)
		return obj
	}
	
	request() {
		let next = this.available.values().next()
		
		if(next.done) // no available objects; create one
			return this._create()
		else {
			// remove object from list of available objects and return it
			this.available.delete(next.value)
			return next.value
		}
	}
	
	return(obj) {
		this.available.add(obj)
	}
}
