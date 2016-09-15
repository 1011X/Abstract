class Option {
	constructor(a) {
		this._state = (a === undefined)? Option.None : Option.Some
		this._value = a
	}
	
	insert(val) {
		this._state = Option.Some
		this._value = val
	}
	
	swap(val) {
		if(!(val instanceof Option)) {
			throw new TypeError("Swapped with non-`Option`")
		}
		
		let t = this._value
		this._value = val._value
		val._value = t
	}
	
	isNone() {
		return this._state === Option.None
	}
	
	isSome() {
		return this._state === Option.Some
	}
	
	expect(msg) {
		if(this.isSome()) {
			return this._value
		}
		
		throw new ReferenceError(msg)
	}
	
	unwrap() {
		return this.expect("Unwrapped `None` value")
	}
	
	unwrapOr(a) {
		return this.isNone()? a : this._value
	}
	
	unwrapOrElse(f) {
		return this.isNone()? a : f()
	}
	
	map(f) {
		if(this.isSome()) {
			return new Option(f(this._value))
		}
		
		return new Option()
	}
}

Option.None = 0
Option.Some = 1

Object.freeze(Option)
