/* --------------------
 * @overlook/plugin-start module
 * Jest config
 * ------------------*/

'use strict';

// Exports

module.exports = {
	testEnvironment: 'node',
	coverageDirectory: 'coverage',
	collectCoverageFrom: ['index.js', 'lib/**/*.js'],
	setupFilesAfterEnv: ['jest-extended'],
	moduleNameMapper: {
		'^@overlook/plugin-start$': '<rootDir>/index.js'
	}
};
