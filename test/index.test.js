/* --------------------
 * @overlook/plugin-start module
 * Tests
 * ------------------*/

'use strict';

// Modules
const startPlugin = require('@overlook/plugin-start');

// Init
require('./support/index.js');

// Tests

describe('tests', () => {
	it.skip('all', () => { // eslint-disable-line jest/no-disabled-tests
		expect(startPlugin).not.toBeUndefined();
	});
});
