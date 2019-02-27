class Option {
    static Some(data) {
        return new OptionInstance('Some', [data])
    }
    
    static None() {
        return new OptionInstance('None')
    }
    
    static fromJSON(json) {
        return new OptionInstance(json.kind, [json.data])
    }
}

class OptionInstance extends Instance {
    constructor(kind, data) {
        super(kind, data)
    }
    
    unwrap_or(def) {
        return this.match({
            Some:a  => a,
            None:() => def,
        })
    }
    
    map(f) {
        return this.match({
            Some:a => Option.Some(f(a)),
            None:() => Option.None(),
        })
    }
}
