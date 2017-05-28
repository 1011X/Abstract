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
	
	get(name) {
		if(this.nameMap.has(name)) {
			return this.nameMap.get(name)
		}
		return this.value
	}
	
	getById(id) {
		if(this.idMap.has(id)) {
			return this.idMap.get(id)
		}
		return this.value
	}
	
	getName(val) {
		for(let entry of this.nameMap.entries()) {
			if(val === entry[1]) {
				return entry[0]
			}
		}
		return this.key
	}
}
