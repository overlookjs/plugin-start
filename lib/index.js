/* --------------------
 * @overlook/plugin-start module
 * Entry point
 * ------------------*/

'use strict';

// Modules
const Plugin = require('@overlook/plugin'),
	{INIT_PROPS, INIT_ROUTE, DEBUG_ZONE} = require('@overlook/route'),
	invariant = require('simple-invariant');

// Imports
const pkg = require('../package.json');

// Constants
const IDLE = 0,
	STARTING = 1,
	STARTED = 2,
	STOPPING = 3;
const STATE_NAMES = ['idle', 'starting', 'started', 'stopping'];

// Exports

module.exports = new Plugin(
	pkg,
	{
		symbols: [
			'START', 'START_ROUTE', 'START_CHILDREN',
			'STOP', 'STOP_ROUTE', 'STOP_CHILDREN',
			'START_STATE'
		]
	},
	(Route, {
		START, START_ROUTE, START_CHILDREN,
		STOP, STOP_ROUTE, STOP_CHILDREN,
		START_STATE
	}) => class StartStopRoute extends Route {
		[INIT_PROPS](props) {
			super[INIT_PROPS](props);
			this[START_STATE] = undefined;
		}

		async [INIT_ROUTE]() {
			await super[INIT_ROUTE]();
			this[START_STATE] = IDLE;
		}

		/**
		 * Start route and children.
		 * Should NOT be extended in subclasses.
		 * Current route is started before children. Children are then started in parallel.
		 */
		[START]() {
			return this[DEBUG_ZONE](async () => {
				const state = this[START_STATE];
				invariant(state === IDLE, `Cannot start - currently ${STATE_NAMES[state]}`);

				this[START_STATE] = STARTING;
				await this[START_ROUTE]();
				await this[START_CHILDREN]();
				this[START_STATE] = STARTED;
			});
		}

		// Intended to be extended in subclasses
		async [START_ROUTE]() {} // eslint-disable-line class-methods-use-this, no-empty-function

		// Can be extended in subclasses
		[START_CHILDREN]() {
			// Start all children in parallel
			return callMethodOnChildrenInParallel(this, START);
		}

		/**
		 * Stop route and children.
		 * Should NOT be extended in subclasses.
		 * Stopping occurs in reverse order from starting.
		 * Children are stopped (in parallel) *before* the current route.
		 */
		[STOP]() {
			return this[DEBUG_ZONE](async () => {
				const state = this[START_STATE];
				invariant(state === STARTED, `Cannot stop - currently ${STATE_NAMES[state]}`);

				this[START_STATE] = STOPPING;
				await this[STOP_CHILDREN]();
				await this[STOP_ROUTE]();
				this[START_STATE] = IDLE;
			});
		}

		// Intended to be extended in subclasses
		async [STOP_ROUTE]() {} // eslint-disable-line class-methods-use-this, no-empty-function

		// Can be extended in subclasses
		[STOP_CHILDREN]() {
			// Stop all children in parallel
			return callMethodOnChildrenInParallel(this, STOP);
		}
	}
);

function callMethodOnChildrenInParallel(route, methodName) {
	// eslint-disable-next-line consistent-return, array-callback-return
	return Promise.all(route.children.map((child) => {
		if (child[methodName]) return child[methodName]();
	}));
}
