var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var isMemberSymbol = canSymbol.for("can.isMember");

var primitives = new Map();
[Number, String, Boolean].forEach(function(Type) {
	var typeString = Type.name.toLowerCase();
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
	var createNewOfType = function(val) {
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
	};

	var values = [Type, null, undefined];
	if (Type === Boolean) {
		values = [true, false, null, undefined];
	}

	return canReflect.assignSymbols(createNewOfType, {
		"can.new": createNewOfType,
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
	var createNewOfType = function(val) {
		if (val instanceof Type || isMember(val)) {
			return val;
		}
		// Convert `'false'` into `false`
		if (Type === Boolean && (val === 'false' || val === '0')) {
			return false;
		}
		return action(Type, val);
	};

	var values = [Type];
	if (Type === Boolean) {
		values = [true, false];
	}

	return canReflect.assignSymbols(createNewOfType, {
		"can.new": createNewOfType,
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
	throw new Error(`Type value ${typeof val === "string" ? '"' + val + '"' : val} is not of type ${canReflect.getName(Type)}.`);
}

function convert(Type, val) {
	return canReflect.convert(val, Type);
}

function late(fn) {
	var type = {};
	var underlyingType;
	var unwrap = function() {
		underlyingType = fn();
		unwrap = function() { return underlyingType; };
		return underlyingType;
	}
	return canReflect.assignSymbols(type, {
		"can.new": function(val) {
			return canReflect.new(unwrap(), val);
		},
		"can.isMember": function(val) {
			return unwrap()[isMemberSymbol](val);
		},
		"can.unwrapType": function() {
			return fn();
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

exports.Any = Any;
exports.late = late;
