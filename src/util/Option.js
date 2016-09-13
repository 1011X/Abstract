class Option {
	constructor(a) {
		this._state = (a === undefined)? Option.None : Option.Some
		this._value = a
	}
	
	isNone() {
		return this.state === Option.None
	}
	
	isSome() {
		return this.state === Option.Some
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
