/* --------------------
 * @overlook/plugin-start module
 * Tests
 * Test function to ensure all exports present
 * ------------------*/

/* eslint-disable jest/no-export */

'use strict';

// Exports

module.exports = function itExports(plugin) {
	it.each([
		'START',
		'START_ROUTE',
		'START_CHILDREN',
		'STOP',
		'STOP_ROUTE',
		'STOP_CHILDREN',
		'START_STATE'
	])('%s', (key) => {
		expect(typeof plugin[key]).toBe('symbol');
	});
};
