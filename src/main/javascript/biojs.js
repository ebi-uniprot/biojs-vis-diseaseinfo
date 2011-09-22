/*
	Biojs.js, version 1.0
	Copyright 2011, John Gomez
	License: http://www.opensource.org/licenses/mit-license.php
	
	This is an extended version of Base.js from http://dean.edwards.name/base/Base.js
	It was adjusted to support events handling in order to make a base line for the Biojs Library
	
*/

var Biojs = function() {
	// dummy
};

var EventHandler = function(eventType) {
	this.eventType = eventType;
	this.listeners = [];
};

EventHandler.prototype = {

	addListener : function ( actionPerformed ) {
		if ( (typeof actionPerformed) == "function" ) {
			this.listeners.push(actionPerformed);
		}
	},
	
	triggerEvent : function( eventObject ) {
		for ( var i in this.listeners ) {
			this.listeners[i](eventObject);
		}
	}
};

Biojs.extend = function(_instance, _static) { // subclass
	var extend = Biojs.prototype.extend;
	
	// build the prototype
	Biojs._prototyping = true;
	var proto = new this;
	extend.call(proto, _instance);
	proto.base = function() {
		// call this method from any other method to invoke that method's ancestor
	};
	delete Biojs._prototyping;
	
	// create the wrapper for the constructor function
	//var constructor = proto.constructor.valueOf(); //-dean
	var constructor = proto.constructor;
	var klass = proto.constructor = function() {
		if (!Biojs._prototyping) {
			if (this._constructing || this.constructor == klass) { // instantiation
				this._constructing = true;
				constructor.apply(this, arguments);
				delete this._constructing;
			} else if (arguments[0] != null) { // casting
				return (arguments[0].extend || extend).call(arguments[0], proto);
			}
		}
	};
	
	// build the class interface
	klass.ancestor = this;
	klass.extend = this.extend;
	klass.forEach = this.forEach;
	klass.implement = this.implement;
	klass.prototype = proto;
	klass.toString = this.toString;
	klass.valueOf = function(type) {
		//return (type == "object") ? klass : constructor; //-dean
		return (type == "object") ? klass : constructor.valueOf();
	};
	extend.call(klass, _static);
	
	// class initialization
	if (typeof klass.init == "function") {
		klass.init();
	}
	
	return klass;
};

Biojs.prototype = {	
	extend: function(source, value) {
		if (arguments.length > 1) { // extending with a name/value pair
			var ancestor = this[source];
			if (ancestor && (typeof value == "function") && // overriding a method?
				// the valueOf() comparison is to avoid circular references
				(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
				/\bbase\b/.test(value)) {
				// get the underlying method
				var method = value.valueOf();
				// override
				value = function() {
					var previous = this.base || Biojs.prototype.base;
					this.base = ancestor;
					var returnValue = method.apply(this, arguments);
					this.base = previous;
					return returnValue;
				};
				// point to the underlying method
				value.valueOf = function(type) {
					return (type == "object") ? value : method;
				};
				value.toString = Biojs.toString;
			}
			this[source] = value;
		} else if (source) { // extending with an object literal
			var extend = Biojs.prototype.extend;
			// if this object has a customised extend method then use it
			if (!Biojs._prototyping && typeof this != "function") {
				extend = this.extend || extend;
			}
			var proto = {toSource: null};
			// do the "toString" and other methods manually
			var hidden = ["constructor", "toString", "valueOf"];
			// if we are prototyping then include the constructor
			var i = Biojs._prototyping ? 0 : 1;
			while (key = hidden[i++]) {
				if (source[key] != proto[key]) {
					extend.call(this, key, source[key]);
				}
			}
			// copy each of the source object's properties to this object
			for (var key in source) {
				if (!proto[key]) extend.call(this, key, source[key]);
			}
		}
		return this;
	},
	
	//
	// Register a function under an event type
	// in order to execute it whenever the event is triggered
	// 	eventType -> [string] the event to be listened 
	// 	actionPerformed -> [function] the action to be executed
	// 
	addListener: function(eventType, actionPerformed) {
		
		// register the listener in this._eventHandlers for the eventType  
		for(var key in this._eventHandlers) {
			if ( eventType == this._eventHandlers[key].eventType ) {
				this._eventHandlers[key].addListener( actionPerformed );
				return;
			}
		}
		
		if ( typeof eventHandlersRegistered != "boolean" ) {
			// EventHandler does not exist in this._eventHandlers
			// Because the event handlers are not initialized yet
			if ( typeof this.eventTypes == "object" ) {
				// Create an event handler for each eventType in eventTypes
				for ( var key in this.eventTypes ) {
					this._eventHandlers.push( new EventHandler( this.eventTypes[key] ) );
				}
			} 
			eventHandlersRegistered = true;
			this.addListener( eventType, actionPerformed );
			
		} 
	},
	//
	// Trigger the registered functions under an event type
	// 	eventType -> [string] the event to be raised
	//  params -> values to be included into Event object 
	//
	raiseEvent : function(eventType, params) {
		for(var key in this._eventHandlers ) {
			if ( eventType == this._eventHandlers[key].eventType ) {
				this._eventHandlers[key].triggerEvent( new Event ( eventType, params, this ) );
				return;
			}
		}
	},
	
	
	//
	// Save the option values to be applied to this component
	// 	options -> [Object] containing the values
	//	
	setOptions : function (options) {
		if ( this.opt instanceof Object )
		{
			for ( var key in options ) {
				this.opt[key] = options[key];
			}
		} 
	},
	
	// 
	// Connect this component with another by means listening its events
	// 	source -> [BioJs] the another component 
	// 	eventType -> [string] the event to be listened 
	// 	callbackFunction -> [function] the action to be executed
	//
	listen: function ( source, eventType, callbackFunction ) {		
		if ( source instanceof Biojs ){
			if ( typeof callbackFunction == "function" ) {
				source.addListener(eventType, callbackFunction);
			} 
		} 
	},
	
	// Internal array containing the Event Handlers
	_eventHandlers : [ new EventHandler("onClick") ]
	
};

// initialize
Biojs = Biojs.extend({
		constructor: function() {
			this.extend(arguments[0]);
		}
	}, 
	{
		ancestor: Object,
		version: "1.1",
		
		forEach: function(object, block, context) {
			for (var key in object) {
				if (this.prototype[key] === undefined) {
					block.call(context, object[key], key, object);
				}
			}
		},
		
		implement: function() {
			for (var i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] == "function") {
					// if it's a function, call it
					arguments[i](this.prototype);
				} else {
					// add the interface using the extend method
					this.prototype.extend(arguments[i]);
				}
			}
			return this;
		},
		
		toString: function() {
			return String(this.valueOf());
		}		
});


var Event = function ( type, data, source ) {
	this.source = source;
	this.type = type;
	
	for ( var key in data ) {
		this[key] = data[key];
	}
	
};

