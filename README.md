[![NPM version](https://img.shields.io/npm/v/@overlook/plugin-start.svg)](https://www.npmjs.com/package/@overlook/plugin-start)
[![Build Status](https://img.shields.io/travis/overlookjs/plugin-start/master.svg)](http://travis-ci.org/overlookjs/plugin-start)
[![Dependency Status](https://img.shields.io/david/overlookjs/plugin-start.svg)](https://david-dm.org/overlookjs/plugin-start)
[![Dev dependency Status](https://img.shields.io/david/dev/overlookjs/plugin-start.svg)](https://david-dm.org/overlookjs/plugin-start)
[![Greenkeeper badge](https://badges.greenkeeper.io/overlookjs/plugin-start.svg)](https://greenkeeper.io/)
[![Coverage Status](https://img.shields.io/coveralls/overlookjs/plugin-start/master.svg)](https://coveralls.io/r/overlookjs/plugin-start)

# Overlook framework start plugin

Part of the [Overlook framework](https://overlookjs.github.io/).

## Usage

### Methods

This plugin adds the following methods to a Route:

* `[START]`
* `[START_ROUTE]`
* `[START_CHILDREN]`
* `[STOP]`
* `[STOP_ROUTE]`
* `[STOP_CHILDREN]`

`[START]` calls `[START_ROUTE]` and then `[START_CHILDREN]`, which in turn calls `[START]` on all child routes. So calling `[START]` on root route will cascade calls to `[START_ROUTE]` to every route in the routes tree which uses this plugin.

`[STOP]` works the same, except shutdown occurs in reverse order - children are stopped before parents.

All methods are async (i.e. can return promises).

### How to use

If you want to perform some action when the application starts/stops, extend `[START_ROUTE]` and `[STOP_ROUTE]` methods.

e.g. To start/stop an [express](https://expressjs.com/) server when application starts/stops:

```js
const Route = require('@overlook/route');
const startPlugin = require('@overlook/plugin-start');
const express = require('express');

const StartStopRoute = Route.extend( startPlugin );
const { START_ROUTE, STOP_ROUTE } = startPlugin;

const SERVER = Symbol('SERVER');
const PORT = 3000;

class ServerRoute extends StartStopRoute {
  async [START_ROUTE]() {
    // Delegate to superiors
    await super[START_ROUTE]();

    // Create express app
    // and wait for server to start
    const expressApp = express();

    expressApp.use( (req, res) => {
      // Overlook uses a single request object
      // rather than `req` + `res` pair
      req.res = res;
      this.handle( req );
    } );

    await new Promise( (resolve, reject) => {
      this[SERVER] = expressApp.listen(
        PORT,
        (err) => {
          if ( err ) return reject( err );
          resolve();
        }
      );
    });
  }

  async [STOP_ROUTE]() {
    // Shutdown server
    await new Promise( (resolve, reject) => {
      this[SERVER].close( (err) => {
        if ( err ) return reject( err );
        resolve();
      } );
    } );

    // Delegate to superiors
    // NB After server shutdown so order of
    // stopping is reverse of start up.
    await super[STOP_ROUTE]();
  }
}
```

When the application is loaded, you can then call `router[START]` to start it serving requests.

NB [@overlook/plugin-serve-http](https://www.npmjs.com/package/@overlook/plugin-serve-http) does much the same as above example.

## Versioning

This module follows [semver](https://semver.org/). Breaking changes will only be made in major version updates.

All active NodeJS release lines are supported (v10+ at time of writing). After a release line of NodeJS reaches end of life according to [Node's LTS schedule](https://nodejs.org/en/about/releases/), support for that version of Node may be dropped at any time, and this will not be considered a breaking change. Dropping support for a Node version will be made in a minor version update (e.g. 1.2.0 to 1.3.0). If you are using a Node version which is approaching end of life, pin your dependency of this module to patch updates only using tilde (`~`) e.g. `~1.2.3` to avoid breakages.

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See [changelog.md](https://github.com/overlookjs/plugin-start/blob/master/changelog.md)

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/overlookjs/plugin-start/issues

## Contribution

Pull requests are very welcome. Please:

* ensure all tests pass before submitting PR
* add tests for new features
* document new functionality/API additions in README
* do not add an entry to Changelog (Changelog is created when cutting releases)
