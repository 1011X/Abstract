"use strict"

function Style(options){
	this.updated = false
	
	options = options || {}
	
	this._color = options.color || "white"
	this._borderColor = options.borderColor || "black"
	this._symbol = null
	this._textColor = options.textColor || "black"
	
	if(typeof options.symbol == "object"){
		var img = new Image
		img.src = options.symbol
		this._symbol = img
	}
	else if(typeof options.symbol == "string")
		this._symbol = options.symbol
}

Style.prototype = {
	
	get color(){
		return this._color
	},
	
	set color(val){
		this.updated = true
		this._color = val
	},
	
	get borderColor(){
		return this._borderColor
	},
	
	set borderColor(val){
		this.updated = true
		this._borderColor = val
	},
	
	get symbol(){
		return this._symbol
	},
	
	set symbol(val){
		this.updated = true
		if(typeof val == "object"){
			var img = new Image
			img.src = val
			this._symbol = img
		}
		else if(typeof val == "string")
			this._symbol = val
	},
	
	get textColor(){
		return this._textColor
	},
	
	set textColor(val){
		this.updated = true
		this._textColor = val
	},
}