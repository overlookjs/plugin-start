/* --------------------
 * @overlook/plugin-start module
 * Tests ESLint config
 * ------------------*/

'use strict';

// Exports

module.exports = {
	extends: [
		'@overlookmotel/eslint-config-jest'
	],
	rules: {
		'import/no-unresolved': ['error', {ignore: ['^@overlook/plugin-start$']}],
		'node/no-missing-require': ['error', {allowModules: ['@overlook/plugin-start']}]
	}
};
