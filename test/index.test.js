/* --------------------
 * @overlook/plugin-start module
 * Tests
 * ------------------*/

'use strict';

// Modules
const Route = require('@overlook/route'),
	Plugin = require('@overlook/plugin'),
	startPlugin = require('@overlook/plugin-start');

const {
	START, START_ROUTE, START_CHILDREN,
	STOP, STOP_ROUTE, STOP_CHILDREN
} = startPlugin;

// Imports
const {spy, defer, wait} = require('./support/utils.js');

// Init
require('./support/index.js');

// Tests

describe('plugin', () => {
	it('is a Plugin', () => {
		expect(startPlugin).toBeInstanceOf(Plugin);
	});

	it('when passed to `Route.extend()`, returns subclass of Route', () => {
		const StartRoute = Route.extend(startPlugin);
		expect(StartRoute).toBeDirectSubclassOf(Route);
	});
});

const StartRoute = Route.extend(startPlugin);

describe('methods', () => {
	let route;
	beforeEach(() => {
		route = new StartRoute();
	});

	describe('[START]', () => {
		it('calls [START_ROUTE]', async () => {
			route[START_ROUTE] = spy();
			await route.init();
			await route[START]();
			expect(route[START_ROUTE]).toHaveBeenCalledTimes(1);
		});

		it('calls [START_CHILDREN]', async () => {
			route[START_CHILDREN] = spy();
			await route.init();
			await route[START]();
			expect(route[START_CHILDREN]).toHaveBeenCalledTimes(1);
		});

		it('awaits [START_ROUTE] before calling [START_CHILDREN]', async () => {
			const deferred = defer();
			route[START_ROUTE] = spy(() => deferred.promise);
			route[START_CHILDREN] = spy();

			await route.init();
			const promise = route[START]();
			expect(route[START_ROUTE]).toHaveBeenCalledTimes(1);
			await wait();
			expect(route[START_CHILDREN]).not.toHaveBeenCalled();

			deferred.resolve();
			await promise;

			expect(route[START_CHILDREN]).toHaveBeenCalledTimes(1);
		});

		it('calls [START] on all children', async () => {
			const child1 = new Route();
			child1[START] = spy();
			route.attachChild(child1);
			const child2 = new Route();
			child2[START] = spy();
			route.attachChild(child2);

			await route.init();
			await route[START]();
			expect(child1[START]).toHaveBeenCalledTimes(1);
			expect(child2[START]).toHaveBeenCalledTimes(1);
		});

		it('calls [START] on children in parallel', async () => {
			const child1 = new Route();
			const deferred = defer();
			child1[START] = spy(() => deferred.promise);
			route.attachChild(child1);
			const child2 = new Route();
			child2[START] = spy();
			route.attachChild(child2);

			await route.init();
			const promise = route[START]();
			await wait();
			expect(child1[START]).toHaveBeenCalledTimes(1);
			expect(child2[START]).toHaveBeenCalledTimes(1);

			deferred.resolve();
			await promise;
		});

		it('can start up again after stopped', async () => {
			let isStarted = false;
			route[START_ROUTE] = () => { isStarted = true; };
			route[STOP_ROUTE] = () => { isStarted = false; };

			await route.init();
			await route[START]();
			expect(isStarted).toBeTrue();
			await route[STOP]();
			expect(isStarted).toBeFalse();
			await route[START]();
			expect(isStarted).toBeTrue();
		});

		describe('errors if', () => {
			beforeEach(async () => {
				await route.init();
			});

			it('call [START] when already started', async () => {
				await route[START]();
				await expect(route[START]()).rejects.toThrow('Cannot start - currently started');
			});

			it('call [START] when already starting', async () => {
				const promise = route[START]();
				await expect(route[START]()).rejects.toThrow('Cannot start - currently starting');
				await promise;
			});

			it('call [START] when stopping', async () => {
				await route[START]();
				const promise = route[STOP]();
				await expect(route[START]()).rejects.toThrow('Cannot start - currently stopping');
				await promise;
			});
		});

		describe('error tags error with correct route path', () => {
			describe('on root', () => {
				beforeEach(async () => {
					await route.init();
				});

				it('in [START_ROUTE]', async () => {
					route[START_ROUTE] = () => { throw new Error('oops'); };
					await expect(route[START]()).rejects.toThrow(new Error('oops (router path /)'));
				});

				it('in [START_CHILDREN]', async () => {
					route[START_CHILDREN] = () => { throw new Error('oops'); };
					await expect(route[START]()).rejects.toThrow(new Error('oops (router path /)'));
				});
			});

			describe('on child', () => {
				let child;
				beforeEach(async () => {
					child = new StartRoute({name: 'childish'});
					route.attachChild(child);
					await route.init();
				});

				it('in [START_ROUTE]', async () => {
					child[START_ROUTE] = () => { throw new Error('oops'); };
					await expect(route[START]()).rejects.toThrow(new Error('oops (router path /childish)'));
				});

				it('in [START_CHILDREN]', async () => {
					child[START_CHILDREN] = () => { throw new Error('oops'); };
					await expect(route[START]()).rejects.toThrow(new Error('oops (router path /childish)'));
				});
			});
		});
	});

	describe('[STOP]', () => {
		it('calls [STOP_ROUTE]', async () => {
			route[STOP_ROUTE] = spy();
			await route.init();
			await route[START]();
			await route[STOP]();
			expect(route[STOP_ROUTE]).toHaveBeenCalledTimes(1);
		});

		it('calls [STOP_CHILDREN]', async () => {
			route[STOP_CHILDREN] = spy();
			await route.init();
			await route[START]();
			await route[STOP]();
			expect(route[STOP_CHILDREN]).toHaveBeenCalledTimes(1);
		});

		it('awaits [STOP_CHILDREN] before calling [STOP_ROUTE]', async () => {
			const deferred = defer();
			route[STOP_ROUTE] = spy();
			route[STOP_CHILDREN] = spy(() => deferred.promise);

			await route.init();
			await route[START]();
			const promise = route[STOP]();
			expect(route[STOP_CHILDREN]).toHaveBeenCalledTimes(1);
			await wait();
			expect(route[STOP_ROUTE]).not.toHaveBeenCalled();

			deferred.resolve();
			await promise;

			expect(route[STOP_ROUTE]).toHaveBeenCalledTimes(1);
		});

		it('calls [STOP] on all children', async () => {
			const child1 = new Route();
			child1[STOP] = spy();
			route.attachChild(child1);
			const child2 = new Route();
			child2[STOP] = spy();
			route.attachChild(child2);

			await route.init();
			await route[START]();
			await route[STOP]();
			expect(child1[STOP]).toHaveBeenCalledTimes(1);
			expect(child2[STOP]).toHaveBeenCalledTimes(1);
		});

		it('calls [STOP] on children in parallel', async () => {
			const child1 = new Route();
			const deferred = defer();
			child1[STOP] = spy(() => deferred.promise);
			route.attachChild(child1);
			const child2 = new Route();
			child2[STOP] = spy();
			route.attachChild(child2);

			await route.init();
			await route[START]();
			const promise = route[STOP]();
			await wait();
			expect(child1[STOP]).toHaveBeenCalledTimes(1);
			expect(child2[STOP]).toHaveBeenCalledTimes(1);

			deferred.resolve();
			await promise;
		});

		it('can stop after started', async () => {
			let isStarted = false;
			route[START_ROUTE] = () => { isStarted = true; };
			route[STOP_ROUTE] = () => { isStarted = false; };

			await route.init();
			await route[START]();
			expect(isStarted).toBeTrue();
			await route[STOP]();
			expect(isStarted).toBeFalse();
		});

		describe('errors if', () => {
			beforeEach(async () => {
				await route.init();
			});

			it('call [STOP] when not started', async () => {
				await expect(route[STOP]()).rejects.toThrow('Cannot stop - currently idle');
			});

			it('call [STOP] while starting', async () => {
				const promise = route[START]();
				await expect(route[STOP]()).rejects.toThrow('Cannot stop - currently starting');
				await promise;
			});

			it('call [STOP] while already stopping', async () => {
				await route[START]();
				const promise = route[STOP]();
				await expect(route[STOP]()).rejects.toThrow('Cannot stop - currently stopping');
				await promise;
			});
		});

		describe('error tags error with correct route path', () => {
			describe('on root', () => {
				beforeEach(async () => {
					await route.init();
					await route[START]();
				});

				it('in [STOP_ROUTE]', async () => {
					route[STOP_ROUTE] = () => { throw new Error('oops'); };
					await expect(route[STOP]()).rejects.toThrow(new Error('oops (router path /)'));
				});

				it('in [STOP_CHILDREN]', async () => {
					route[STOP_CHILDREN] = () => { throw new Error('oops'); };
					await expect(route[STOP]()).rejects.toThrow(new Error('oops (router path /)'));
				});
			});

			describe('on child', () => {
				let child;
				beforeEach(async () => {
					child = new StartRoute({name: 'childish'});
					route.attachChild(child);
					await route.init();
					await route[START]();
				});

				it('in [STOP_ROUTE]', async () => {
					child[STOP_ROUTE] = () => { throw new Error('oops'); };
					await expect(route[STOP]()).rejects.toThrow(new Error('oops (router path /childish)'));
				});

				it('in [STOP_CHILDREN]', async () => {
					child[STOP_CHILDREN] = () => { throw new Error('oops'); };
					await expect(route[STOP]()).rejects.toThrow(new Error('oops (router path /childish)'));
				});
			});
		});
	});
});
