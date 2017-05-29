class RegistryWithDefault {
	constructor(name) {
		this.key = name
		this.value = null
		this.idMap = new Map
		this.nameMap = new Map
	}
	
	get size() {
		return this.idMap.size
	}
	
	add(id, name, object) {
		if(this.key === name) {
			this.value = object
		}
		
		this.idMap.set(id, object)
		this.nameMap.set(name, object)
	}
	
	get(param) {
		switch(typeof param) {
			case "number":
				return this.idMap.get(param) || this.value
			case "string":
				return this.nameMap.get(param) || this.value
			default:
				throw new TypeError("RegistryWithDefault: Invalid parameter type.")
		}
	}
	
	getName(param) {
		let val
		
		switch(typeof param) {
			case "number":
				// if id is given, get its constructor
				val = this.get(param); break
			case "function":
				val = param; break
			default:
				throw new TypeError("RegistryWithDefault: Invalid parameter type.")
		}
		
		// iterate thru name entries
		for(let entry of this.nameMap.entries()) {
			if(val === entry[1]) {
				return entry[0]
			}
		}
		
		return this.key
	}
	
	getId(param) {
		let val
		
		switch(typeof param) {
			case "string":
				// if name is given, get its constructor
				val = this.get(param); break
			case "function":
				val = param; break
			default:
				throw new TypeError("RegistryWithDefault: Invalid parameter type.")
		}
		
		for(let entry of this.idMap.entries()) {
			if(val === entry[1]) {
				return entry[0]
			}
		}
		
		return -1
	}
}
