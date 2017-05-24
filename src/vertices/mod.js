Vertex = Object.create(null)
Vertex._registry = new RegistryWithDefault("none")

// TODO fix this.

Vertex.register = function(index, typename, constructor) {
	let registry = Vertex._registry
	
	if(registry.get(typename) === registry.key) {
		console.warn(`Replacing default with ${constructor.name} at index ${index}`)
	}
	
	let def = registry.getById(index)
	if(def !== null || def !== registry.value) {
		console.warn(`Replacing ${def} at index ${index} with ${constructor}`)
		console.warn(`Default: ${registry.value}`)
	}
	
	registry.add(index, typename, constructor)
}

// OPT try `Vertex.get = Vertex._registry.get`
Vertex.get = function(name) {
	Vertex._registry.get(name)
}

// OPT same as above
Vertex.getById = function(id) {
	Vertex._registry.getById(id)
}

// OPT same as above
Vertex.size = function() {
	Vertex._registry.size
}
