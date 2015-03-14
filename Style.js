"use strict"

function Style(options){
	this.updated = false
	
	this._color = options.color || "white"
	this._borderColor = options.borderColor || "black"
	this._icon = null
	this._symbol = options.symbol || ""
	this._textColor = options.textColor || "black"
	
	if(options.icon){
		var img = new Image
		img.src = options.icon
		this._icon = img
	}
}

Style.prototype = {
	
	get color(){
		this.updated = true
		return this._color
	},
	
	get borderColor(){
		this.updated = true
		return this._borderColor
	},
	
	get icon(){
		this.updated = true
		return this._icon
	},
	
	get symbol(){
		this.updated = true
		return this._symbol
	},
	
	get textColor(){
		this.updated = true
		return this._textColor
	}
}