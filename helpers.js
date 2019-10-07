// Helper function to capitalize the result of typeof
// see `can-type.check` function
var capitalizeTypeName = function(type) {
	if (typeof type !== 'string') {
		throw new Error('Type must be string');
	}
	return type.charAt(0).toUpperCase() + type.slice(1);
};

module.exports = {
	capitalizeTypeName
};