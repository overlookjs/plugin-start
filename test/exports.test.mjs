/* --------------------
 * @overlook/plugin-start module
 * Tests
 * ESM export
 * ------------------*/

// Modules
import Plugin from '@overlook/plugin';
import startPlugin, * as namedExports from '@overlook/plugin-start/es';

// Imports
import itExports from './exports.js';

// Tests

describe('ESM export', () => { // eslint-disable-line jest/lowercase-name
	it('is an instance of Plugin class', () => {
		expect(startPlugin).toBeInstanceOf(Plugin);
	});

	describe('default export has properties', () => {
		itExports(startPlugin);
	});

	describe('named exports', () => {
		itExports(namedExports);
	});
});
