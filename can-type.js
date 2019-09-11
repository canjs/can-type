var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var isMemberSymbol = canSymbol.for("can.isMember");
var newSymbol = canSymbol.for("can.new");
var getSchemaSymbol = canSymbol.for("can.getSchema");
var baseTypeSymbol = canSymbol.for("can.baseType");
var strictTypeOfSymbol = canSymbol.for("can.strictTypeOf");

var type = exports;
function makeSchema(values) {
	return function(){
		return {
			type: "Or",
			values: values
		};
	};
}

// Default "can.new"
function canNew(value) {
	if(this[isMemberSymbol](value)) {
		return value;
	}

	return canReflect.convert(value, this[baseTypeSymbol]);
}

function strictNew(value) {
	var isMember = this[isMemberSymbol](value);
	if(!isMember) {
		return check(this[baseTypeSymbol], value);
	}
	return value;
}

// "can.new" for Booleans
function booleanNew(value) {
	if (value === "false" || value=== "0") {
		return false;
	}
	return Boolean(value);
}

var maybeValues = Object.freeze([null, undefined]);

function check(Type, val) {
	throw new Error('Type value ' + typeof val === "string" ? '"' + val + '"' : val + ' is not of type ' + canReflect.getName(Type) + '.'	);
}

function makeIsMember(Type) {
	if(isMemberSymbol in Type) {
		return Type[isMemberSymbol];
	}
	return function(value) {
		return value instanceof Type;
	};
}

function makeBaseType(Type) {
	var typeObject = {};
	typeObject[newSymbol] = canNew;
	typeObject[isMemberSymbol] = makeIsMember(Type);
	typeObject[baseTypeSymbol] = Type;
	typeObject[getSchemaSymbol] = makeSchema([Type]);
	Type[strictTypeOfSymbol] = typeObject[strictTypeOfSymbol] = typeObject;
	return typeObject;
}

function makePrimitiveType(Type, typeString) {
	var typeObject = makeBaseType(Type);
	if(Type === Boolean) {
		typeObject[newSymbol] = booleanNew;
		typeObject[getSchemaSymbol] = makeSchema([true, false]);
	}
	typeObject[isMemberSymbol] = function(value) {
		return typeof value === typeString;
	};
	return typeObject;
}

function getBaseType(Type) {
	if(strictTypeOfSymbol in Type) {
		return Type[strictTypeOfSymbol];
	}
	return makeBaseType(Type);
}

function makeMaybe(Type) {
	var isMember = Type[isMemberSymbol];
	return function(value) {
		return value == null || isMember.call(this, value);
	};
}

function makeMaybeSchema(baseType) {
	var baseSchema = canReflect.getSchema(baseType);
	var allValues = baseSchema.values.concat(maybeValues);
	return makeSchema(allValues);
}

function inheritFrom(o, Type, property) {
	if(property in Type) {
		o[property] = Type[property];
	}
}

function wrapName(wrapper, Type) {
	var baseName = canReflect.getName(Type);
	return "type." + wrapper + "(" + baseName + ")";
}

canReflect.each({
	"boolean": Boolean,
	"number": Number,
	"string": String
}, function(Type, typeString) {
	makePrimitiveType(Type, typeString);
});

function makeCache(fn) {
	var cache = new WeakMap();
	return function(Type) {
		if(cache.has(Type)) {
			return cache.get(Type);
		}
		var typeObject = fn.call(this, Type);
		cache.set(Type, typeObject);
		return typeObject;
	};
}

exports.check = makeCache(function(Type) {
	var o = Object.create(getBaseType(Type));
	o[newSymbol] = strictNew;
	inheritFrom(o, Type, isMemberSymbol);
	inheritFrom(o, Type, getSchemaSymbol);
	canReflect.setName(o, wrapName("check", Type));
	return o;
});

exports.convert = makeCache(function(Type) {
	var o = Object.create(getBaseType(Type));
	inheritFrom(o, Type, isMemberSymbol);
	inheritFrom(o, Type, getSchemaSymbol);
	canReflect.setName(o, wrapName("convert", Type));
	return o;
});

exports.maybe = makeCache(function(Type) {
	var baseType = getBaseType(Type);
	var desc = {};
	desc[newSymbol] = {
		value: strictNew
	};
	desc[isMemberSymbol] = {
		value: makeMaybe(baseType)
	};
	desc[getSchemaSymbol] = {
		value: makeMaybeSchema(baseType)
	};
	var o = Object.create(baseType, desc);
	canReflect.setName(o, wrapName("maybe", Type));
	return o;
});

exports.maybeConvert = makeCache(function(Type) {
	var baseType = getBaseType(Type);
	var desc = {};
	desc[isMemberSymbol] = {
		value: makeMaybe(baseType)
	};
	desc[getSchemaSymbol] = {
		value: makeMaybeSchema(baseType)
	};
	var o = Object.create(baseType, desc);
	canReflect.setName(o, wrapName("maybeConvert", Type));
	return o;
});

function isTypeObject(Type) {
	if(canReflect.isPrimitive(Type)) {
		return false;
	}

	return (newSymbol in Type) && (isMemberSymbol in Type);
}

function normalize(Type) {
	if(canReflect.isPrimitive(Type)) {
		throw new Error("can-type: Unable to normalize primitive values.");
	} else if(isTypeObject(Type)) {
		return Type;
	} else {
		return type.check(Type);
	}
}

function late(fn) {
	var lateType = {};
	var underlyingType;
	var unwrap = function() {
		underlyingType = type.normalize(fn());
		unwrap = function() { return underlyingType; };
		return underlyingType;
	};
	return canReflect.assignSymbols(lateType, {
		"can.new": function(val) {
			return canReflect.new(unwrap(), val);
		},
		"can.isMember": function(val) {
			return unwrap()[isMemberSymbol](val);
		}
	});
}

var Any = canReflect.assignSymbols({}, {
	"can.new": function(val) { return val; },
	"can.isMember": function() { return true; }
});

function all(typeFn, Type) {
	var typeObject = typeFn(Type);
	typeObject[getSchemaSymbol] = function() {
		var parentSchema = canReflect.getSchema(Type);
		var schema = canReflect.assignMap({}, parentSchema);
		schema.keys = {};
		canReflect.eachKey(parentSchema.keys, function(value, key) {
			schema.keys[key] = typeFn(value);
		});
		return schema;
	};

	function Constructor(values) {
		var schema = canReflect.getSchema(this);
		var keys = schema.keys;
		var convertedValues = {};
		canReflect.eachKey(values || {}, function(value, key) {
			convertedValues[key] = canReflect.convert(value, keys[key]);
		});
		return canReflect.new(Type, convertedValues);
	}

	canReflect.setName(Constructor, "Converted<" + canReflect.getName(Type) + ">");
	Constructor.prototype = typeObject;

	return Constructor;
}

// type checking should not throw in production
if(process.env.NODE_ENV === 'production') {
	exports.check = exports.convert;
	exports.maybe = exports.maybeConvert;
}

exports.Any = Any;
exports.late = late;
exports.isTypeObject = isTypeObject;
exports.normalize = normalize;
exports.all = all;
exports.convertAll = all.bind(null, exports.convert);
