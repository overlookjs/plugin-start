/* --------------------
 * @overlook/plugin-start
 * Tests utils
 * ------------------*/

'use strict';

// Exports

module.exports = {
	spy: jest.fn,
	defer,
	wait
};

function defer() {
	const deferred = {};
	deferred.promise = new Promise((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});
	return deferred;
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms || 0));
}
