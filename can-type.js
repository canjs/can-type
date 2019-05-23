var canReflect = require("can-reflect");

var primitives = new Map();
[Number, String, Boolean].forEach(function(Type) {
	var typeString = Type.name.toLowerCase();
	primitives.set(Type, {
		isMember: function(val) {
			return typeof val === typeString;
		}
	});
});

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
		return action(Type, val);
	};

	return canReflect.assignSymbols(createNewOfType, {
		"can.new": createNewOfType,
		"can.getSchema": function(){
			return {
				type: "Or",
				values: [Type, undefined, null]
			};
		},
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
		return action(Type, val);
	};

	return canReflect.assignSymbols(createNewOfType, {
		"can.new": createNewOfType,
		"can.getSchema": function(){
			return {
				type: "Or",
				values: [Type]
			};
		},
			"can.getName": function(){
					return canReflect.getName(Type);
			},
		"can.isMember": function(value) {
			return value instanceof Type || isMember(value);
		}
	});
});

function check(Type, val) {
	throw new Error(`Type value '${val}' is not of type ${canReflect.getName(Type)}.`);
}

function convert(Type, val) {
	return canReflect.convert(val, Type);
	//return canReflect.new(Type, val);
}

var Any = canReflect.assignSymbols({}, {
	"can.new": function(val) { return val; },
	"can.isMember": function() { return true }
});

exports.check = createNoMaybe(check);
exports.maybe = createMaybe(check);

exports.convert = createNoMaybe(convert);
exports.maybeConvert = createMaybe(convert);

exports.Any = Any;
