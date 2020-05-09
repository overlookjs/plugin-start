/* --------------------
 * @overlook/plugin-start module
 * Tests
 * CJS export
 * ------------------*/

'use strict';

// Modules
const Plugin = require('@overlook/plugin'),
	startPlugin = require('@overlook/plugin-start');

// Imports
const itExports = require('./exports.js');

// Tests

describe('CJS export', () => { // eslint-disable-line jest/lowercase-name
	it('is an instance of Plugin class', () => {
		expect(startPlugin).toBeInstanceOf(Plugin);
	});

	describe('has properties', () => {
		itExports(startPlugin);
	});
});
