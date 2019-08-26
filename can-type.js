var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var isMemberSymbol = canSymbol.for("can.isMember");
var newSymbol = canSymbol.for("can.new");

var type = exports;

var primitives = new Map();
canReflect.each({
	"boolean": Boolean,
	"number": Number,
	"string": String
}, function(Type, typeString) {
	primitives.set(Type, {
		isMember: function(val) {
			return typeof val === typeString;
		}
	});
});

function makeSchema(values) {
	return function(){
		return {
			type: "Or",
			values: values
		};
	};
}

function makeTypeFactory(createSchema) {
	return function makeTypeWithAction(action) {
		var typeCache = new Map();

		return function createType(Type) {
			if(typeCache.has(Type)) {
				return typeCache.get(Type);
			}

			var isMember = function() { return false; };
			if(primitives.has(Type)) {
				isMember = primitives.get(Type).isMember;
			}

			var createTypeWithSchema = createSchema(Type, action, isMember);
			typeCache.set(Type, createTypeWithSchema);
			return createTypeWithSchema;
		};
	};
}

var createMaybe = makeTypeFactory(function createMaybe(Type, action, isMember) {
	var typeObject = {};

	var values = [Type, null, undefined];
	if (Type === Boolean) {
		values = [true, false, null, undefined];
	}

	return canReflect.assignSymbols(typeObject, {
		"can.new": function(val) {
			if (val == null) {
				return val;
			}
			if (val instanceof Type || isMember(val)) {
				return val;
			}
			// Convert `'false'` into `false`
			if (Type === Boolean && (val === 'false' || val === '0')) {
				return false;
			}
			return action(Type, val);
		},
		"can.getSchema": makeSchema(values),
		"can.getName": function(){
			return canReflect.getName(Type);
		},
		"can.isMember": function(value) {
			return value == null || value instanceof Type || isMember(value);
		}
	});
});

var createNoMaybe = makeTypeFactory(function createNoMaybe(Type, action, isMember) {
	var typeObject = {};

	var values = [Type];
	if (Type === Boolean) {
		values = [true, false];
	}

	return canReflect.assignSymbols(typeObject, {
		"can.new": function(val) {
			if (val instanceof Type || isMember(val)) {
				return val;
			}
			// Convert `'false'` into `false`
			if (Type === Boolean && (val === 'false' || val === '0')) {
				return false;
			}
			return action(Type, val);
		},
		"can.getSchema": makeSchema(values),
		"can.getName": function(){
			return canReflect.getName(Type);
		},
		"can.isMember": function(value) {
			return value instanceof Type || isMember(value);
		}
	});
});

function check(Type, val) {
	throw new Error('Type value ' + typeof val === "string" ? '"' + val + '"' : val + ' is not of type ' + canReflect.getName(Type) + '.'	);
}

function convert(Type, val) {
	return canReflect.convert(val, Type);
}

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

exports.check = createNoMaybe(check);
exports.maybe = createMaybe(check);

exports.convert = createNoMaybe(convert);
exports.maybeConvert = createMaybe(convert);

// type checking should not throw in production
if(process.env.NODE_ENV === 'production') {
	exports.check = exports.convert;
	exports.maybe = exports.maybeConvert;
}

exports.Any = Any;
exports.late = late;
exports.isTypeObject = isTypeObject;
exports.normalize = normalize;
