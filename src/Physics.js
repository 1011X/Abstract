const Physics = {
	next_available: 0,
	// stack of recently deleted handles. for saving space.
	// cannot be a Set; must be able to pop individual entries for add_entity().
	recently_deleted: [],
	positions: null,
	new_positions: null,
	velocities: null,
	
	init(size = 256) {
		this.positions = new Float64Array(size);
		this.velocities = new Float64Array(size);
		
		// buffer next positions to do collision detection
		this.new_positions = new Float64Array(size);
	},
	
	add_entity() {
		if (this.recently_deleted.length === 0) {
			let handle = this.next_available;
			this.next_available += 1;
			return handle
		} else {
			return this.recently_deleted.pop()
		}
	},
	
	remove_entity(handle) {
		if (handle === next_available - 1) {
			next_available -= 1;
		} else {
			// check handle isn't already on the list before adding it
			if (! this.recently_deleted.includes(handle)) {
				this.recently_deleted.push(handle);
			}
		}
	},
	
	set_position(handle, x, y) {
		let i = handle * 2;
		this.positions[i]     = x;
		this.positions[i + 1] = y;
	},
	
	set_velocity(handle, x, y) {
		let i = handle * 2;
		this.velocities[i]     = x;
		this.velocities[i + 1] = y;
	},
	
	step() {
		
	},
	
	// serialization
	toJSON() {
		let positions = this.positions.filter(
			(_e,i,_a) => this.recently_deleted.includes(i)
		);
		let velocities = this.velocities.filter(
			(_e,i,_a) => this.recently_deleted.includes(i)
		);
		return { positions, velocities }
	},
	
	fromJSON(json) {
		
	}
};
