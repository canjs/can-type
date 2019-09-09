var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var isMemberSymbol = canSymbol.for("can.isMember");
var newSymbol = canSymbol.for("can.new");
var getSchemaSymbol = canSymbol.for("can.getSchema");

var type = exports;
function makeSchema(values) {
	return function(){
		return {
			type: "Or",
			values: values
		};
	};
}

// Make an isMember function that prefers a isMemberSymbol on the Type.
function makeIsMember(check) {
	return function isMember(value) {
		var Type = this.Type;
		if(Type[isMemberSymbol]) {
			return Type[isMemberSymbol](value);
		}
		if(check.call(this, value)) {
			return true;
		}
		return false;
	};
}

// Default isMember for non-maybe, non-primitives
function isMember(value) {
	return value instanceof this.Type;
}

// isMember for maybe non-primitives
function maybeIsMember(value) {
	return value == null || value instanceof this.Type;
}

// Default "can.new"
function canNew(value) {
	if(this.isStrict && !this[isMemberSymbol](value)) {
		return check(this.Type, value);
	}

	return canReflect.convert(value, this.Type);
}

// "can.new" for Booleans
function booleanNew(value) {
	if(this.isStrict && !this[isMemberSymbol](value)) {
		return check(Boolean, value);
	}
	if (value === "false" || value=== "0") {
		return false;
	}
	return Boolean(value);
}

var maybeValues = Object.freeze([null, undefined]);

function check(Type, val) {
	throw new Error('Type value ' + typeof val === "string" ? '"' + val + '"' : val + ' is not of type ' + canReflect.getName(Type) + '.'	);
}

/* Base converting proto */
var baseType = {};
canReflect.assignSymbols(baseType, {
	isStrict: false,
	"can.new": canNew,
	"can.isMember": makeIsMember(isMember)
});

/* Descriptor for applying strictness */
var strictDescriptor = {
	isStrict: {
		enumerable: true,
		value: true
	}
};
strictDescriptor[newSymbol] = {
	enumerable: true,
	value: canNew
};

/* Descriptor for applying nonstrictness */
var unStrictDescriptor = {
	isStrict: {
		enumerable: true,
		value: false
	}
};

/* Descriptor for maybe types */
var maybeDescriptors = {};
maybeDescriptors[isMemberSymbol] = {
	enumerable: false,
	value: makeIsMember(maybeIsMember)
};
/* Base maybe type */
var baseMaybeType = Object.create(baseType, maybeDescriptors);

var strictMaybeDescriptor = {
	isStrict: strictDescriptor.isStrict
};
strictMaybeDescriptor[isMemberSymbol] = maybeDescriptors[isMemberSymbol];
strictMaybeDescriptor[newSymbol] = {
	enumerable: true,
	value: canNew
};

var unStrictMaybeDescriptor = {
	isStrict: unStrictDescriptor.isStrict
};
unStrictMaybeDescriptor[isMemberSymbol] = maybeDescriptors[isMemberSymbol];

var primitiveBaseTypes = new Map();
canReflect.each({
	"boolean": Boolean,
	"number": Number,
	"string": String
}, function(Type, typeString) {
	var noMaybeDescriptor = {};
	var maybeDescriptor = {};
	noMaybeDescriptor[isMemberSymbol] = {
		enumerable: true,
		value: 	function isMember(val) {
			return typeof val === typeString;
		}
	};

	maybeDescriptor[isMemberSymbol] = {
		enumerable: true,
		value: 	function isMaybeMember(val) {
			return val == null || typeof val === typeString;
		}
	};

	if(Type === Boolean) {
		noMaybeDescriptor[newSymbol] = maybeDescriptor[newSymbol] = {
			enumerable: true,
			value: booleanNew
		};
		maybeDescriptor[getSchemaSymbol] = makeSchema([true, false, null, undefined]);
		noMaybeDescriptor[getSchemaSymbol] = makeSchema([true, false]);
	}

	primitiveBaseTypes.set(Type, {
		noMaybe: Object.create(baseType, noMaybeDescriptor),
		maybe: Object.create(baseMaybeType, maybeDescriptor)
	});
});

function addType(typeObject, Type) {
	if(!('Type' in typeObject)) {
		Object.defineProperty(typeObject, 'Type', {
			value: Type
		});
	}
}

function getBase(Type, baseType, basePrimitiveName) {
	if(primitiveBaseTypes.has(Type)) {
		return primitiveBaseTypes.get(Type)[basePrimitiveName];
	} else if(isTypeObject(Type)) {
		return Type;
	} else {
		return baseType;
	}
}

function makeTypeFactory(name, baseType, childDescriptors, primitiveMaybe, schemaValues) {
	var typeCache = new WeakMap();
	return function(Type) {
		if(typeCache.has(Type)) {
			return typeCache.get(Type);
		}

		var base = getBase(Type, baseType, primitiveMaybe);
		var typeObject = Object.create(base, childDescriptors);

		addType(typeObject, Type);
		typeObject[getSchemaSymbol] = makeSchema([Type].concat(schemaValues));
		canReflect.setName(typeObject, "type." + name + "(" + canReflect.getName(Type) + ")");
		typeCache.set(Type, typeObject);
		return typeObject;
	};
}

exports.check = makeTypeFactory("check", baseType, strictDescriptor, "noMaybe", []);
exports.convert = makeTypeFactory("convert", baseType, unStrictDescriptor, "noMaybe", []);
exports.maybe = makeTypeFactory("maybe", baseMaybeType, strictMaybeDescriptor, "maybe", maybeValues);
exports.maybeConvert = makeTypeFactory("maybeConvert", baseMaybeType, unStrictMaybeDescriptor, "maybe", maybeValues);


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

// type checking should not throw in production
if(process.env.NODE_ENV === 'production') {
	exports.check = exports.convert;
	exports.maybe = exports.maybeConvert;
}

exports.Any = Any;
exports.late = late;
exports.isTypeObject = isTypeObject;
exports.normalize = normalize;
