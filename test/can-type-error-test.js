var QUnit = require("steal-qunit");
var dev = require("can-test-helpers").dev;
var CanTypeError = require('../can-type-error');

QUnit.module('can-type - CanTypeError');

QUnit.test('CanTypeError custom error type', function(assert) {
	var canTypeError = new CanTypeError('A message');
	assert.ok(canTypeError instanceof CanTypeError, 'Custom error type');
	assert.ok(canTypeError instanceof Error, 'CanTypeError is Derived from Error');
	assert.equal(canTypeError.message, 'A message', 'Get the message');
});