var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");
var type = require("../can-type");
var QUnit = require("steal-qunit");

QUnit.module('can-type - Type methods');

function equal(assert, result, expected) {
	assert.equal(expected, result, "Result matches expected");
}

function strictEqual(assert, result, expected) {
	assert.strictEqual(expected, result, "Result matches expected strictly");
}

function isNaN(assert, result) {
	assert.ok(Number.isNaN(result), "Is NaN value");
}

function ok(assert, reason) {
	assert.ok(true, reason ||  "Expected to throw");
}

function throwsBecauseOfWrongType(assert) {
	ok(assert, "Throws when the wrong type is provided");
}

var checkIsNaN = {
	check: isNaN
};

var checkDateMatchesNumber = {
	check: function(assert, date, num) {
		assert.strictEqual(date.getTime(), num, "Converted number to date");
	}
};

var checkBoolean = function (comparison) {
	return {
		check: function (assert, result) {
			assert.strictEqual(result, comparison, "Boolean has been correctly converted");
		}
	};
};

var matrix = {
	check: {
		check: strictEqual,
		throws: throwsBecauseOfWrongType
	},
	maybe: {
		check: strictEqual,
		throws: throwsBecauseOfWrongType
	},
	convert: {
		check: equal
	},
	maybeConvert: {
		check: equal
	}
};

var dateAsNumber = new Date(1815, 11, 10).getTime();

var testCases = [
	{ Type: Boolean, value: true },
	{ Type: Boolean, value: false },
	{
		Type: Boolean, value: 'true',
		maybeConvert: checkBoolean(true),
		convert: checkBoolean(true),
	},
	{
		Type: Boolean, value: 'false',
		maybeConvert: checkBoolean(false),
		convert: checkBoolean(false),
		maybe: checkBoolean(false),
		check: checkBoolean(false)
	},
	{ Type: Number, value: 23 },
	{ Type: String, value: "foo" },
	{
		Type: Date, value: dateAsNumber,
		convert: checkDateMatchesNumber,
		maybeConvert: checkDateMatchesNumber
	},

	// Can convert types
	{ Type: Number, value: "33" },

	// Can't convert
	{
		Type: Number, value: "foo",
		convert: checkIsNaN,
		maybeConvert: checkIsNaN
	}
];

testCases.forEach(function(testCase) {
	var Type = testCase.Type;
	var value = testCase.value;

	canReflect.each(matrix, function(definition, methodName) {
		var typeName = canReflect.getName(Type);
		var valueName = typeof value === "string" ? ("\"" + value + "\"") : value;
		var testName = typeName + " - " + methodName + " - " + valueName;

		QUnit.test(testName, function(assert) {
			var TypeDefinition = type[methodName](Type);

			try {
				var result = canReflect.convert(value, TypeDefinition);

				if(testCase[methodName] && testCase[methodName].check) {
					testCase[methodName].check(assert, result, value);
				} else {
					definition.check(assert, result, value);
				}
			} catch(err) {
				if(definition.throws) {
					definition.throws(assert);
				} else {
					throw err;
				}
			}
		});
	});
});


QUnit.test("type.Any works as an identity", function(assert) {
	var result = canReflect.convert(45, type.Any);
	assert.equal(result, 45, "Acts as a identity");
});

QUnit.test("type.late(fn) takes a function to define the type later", function(assert) {
	var theType = type.late(() => type.convert(Number));
	var result = canReflect.convert("45", theType);
	assert.equal(result, 45, "Defined late but then converted");
});

QUnit.test("type.late(fn) where the underlying type value is a builtin becomes a strict type", function(assert) {
	var typeType = type.late(() => Number);
	var result = canReflect.convert(45, typeType);
	assert.equal(result, 45, "works with numbers");

	try {
		canReflect.convert("45", typeType);
		assert.ok(false, "Should not have thrown");
	} catch(err) {
		assert.ok(err, "Got an error becomes it is strict");
	}
});

QUnit.test("type.isTypeObject determines if an object is a TypeObject", function(assert) {
	assert.equal(type.isTypeObject({}), false, "Plain objects are not");

	var myTypeObject = {};
	myTypeObject[canSymbol.for("can.new")] = function(){};
	myTypeObject[canSymbol.for("can.isMember")] = function(){};
	assert.equal(type.isTypeObject(myTypeObject), true, "With the symbols it is");

	var myTypeFunction = function(){};
	myTypeFunction[canSymbol.for("can.new")] = function(){};
	myTypeFunction[canSymbol.for("can.isMember")] = function(){};
	assert.equal(type.isTypeObject(myTypeFunction), true, "functions with the symbols are too");

	assert.equal(type.isTypeObject(null), false, "primitives are not");
	assert.equal(type.isTypeObject(undefined), false, "undefined is not");
	assert.equal(type.isTypeObject(23), false, "number primitives too");
	assert.equal(type.isTypeObject(String), false, "builtin constructors are not");
});

QUnit.test("type.normalize takes a Type and returns a TypeObject", function(assert) {
	[String, type.check(String), Date].forEach(function(Type) {
		var typeObject = type.normalize(Type);
		var name = canReflect.getName(Type);
		assert.equal(type.isTypeObject(typeObject), true, "Creates a typeobject for " + name);
	});

	[12, null, "foobar"].forEach(function(primitive) {
		try {
			type.normalize(primitive);
		} catch(err) {
			assert.ok(err, "Unable to normalize primitives");
		}
	});
});

QUnit.test("Should not be able to call new on a TypeObject", function(assert) {
	var typeObject = type.convert(Number);
	try {
		new typeObject();
		assert.ok(false, "Should not be able to call new");
	} catch(err) {
		assert.ok(err, "Got an error calling new");
	}
});
