/* --------------------
 * @overlook/plugin-start module
 * ESM entry point
 * Re-export CJS with named exports
 * ------------------*/

// Exports

import startPlugin from '../lib/index.js';

export default startPlugin;
export const {
	START,
	START_ROUTE,
	START_CHILDREN,
	STOP,
	STOP_ROUTE,
	STOP_CHILDREN,
	START_STATE
} = startPlugin;
