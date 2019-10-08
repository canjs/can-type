var canReflect = require("can-reflect");
var type = require("./can-type");
var QUnit = require("steal-qunit");
var helpers = require("./helpers");

QUnit.module('can-type - Type errors');

var testCases = [
	{expectedTypeName: 'Number', value: '3', ExpectedType: Number},
	{expectedTypeName: 'String', value: 3, ExpectedType: String},
	{expectedTypeName: 'Number', value: false, ExpectedType: Number},
	{expectedTypeName: 'Boolean', value: '', ExpectedType: Boolean}
];

testCases.forEach(function(testCase) {
	var valType = typeof testCase.value;
	var typeName = helpers.capitalizeTypeName(valType);
	var expectedTypeName = testCase.expectedTypeName;
	QUnit.test('Include the type ' + typeName + ' of the value', function(assert) {
		var strictType = type.check(testCase.ExpectedType);
		try {
			canReflect.convert(testCase.value, strictType);
		} catch (error) {
			assert.equal(error.message, testCase.value + ' (' + typeName + ') is not of type ' + expectedTypeName + '.');
		}
	});
});