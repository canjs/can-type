var canReflect = require("can-reflect");
var type = require("../can-type");
var QUnit = require("steal-qunit");

QUnit.module('can-type - Type methods');

function equal(result, expected) {
	QUnit.equal(expected, result, "Result matches expected");
}

function strictEqual(result, expected) {
	QUnit.strictEqual(expected, result, "Result matches expected strictly");
}

function isNaN(result) {
	QUnit.assert.ok(Number.isNaN(result), "Is NaN value");
}

function ok(reason) {
	QUnit.assert.ok(true, reason ||  "Expected to throw");
}

var throwsBecauseOfWrongType = ok.bind(null, "Throws when the wrong type is provided");

var checkIsNaN = {
	check: isNaN
};

var checkDateMatchesNumber = {
	check: function(date, num) {
		QUnit.assert.strictEqual(date.getTime(), num, "Converted number to date");
	}
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

		QUnit.test(testName, function() {
			var TypeDefinition = type[methodName](Type);

			try {
				var result = canReflect.convert(value, TypeDefinition);

				if(testCase[methodName] && testCase[methodName].check) {
					testCase[methodName].check(result, value);
				} else {
					definition.check(result, value);
				}
			} catch(err) {
				if(definition.throws) {
					definition.throws(value, err);
				} else {
					throw err;
				}
			}
		});
	});
});


QUnit.test("types.Any works as an identity", function(assert) {
	var result = canReflect.convert(45, type.Any);
	assert.equal(result, 45, "Acts as a identity");
});
