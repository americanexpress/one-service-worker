[jest]: https://jestjs.io
[ava]: https://github.com/avajs/ava
[test-environment]: https://jestjs.io/docs/en/configuration#testenvironment-string
[test-environment-options]: https://jestjs.io/docs/en/configuration#testenvironmentoptions-object

[playwright-docs]: https://github.com/microsoft/playwright/blob/master/docs/api.md#browsercontextaddinitscriptscript-args
[playwright]: https://github.com/microsoft/playwright
[sw-test-env]: https://github.com/popeindustries/sw-test-env
[service-worker-mock]: https://github.com/pinterest/service-workers/tree/master/packages/service-worker-mock
[fake-indexeddb]: https://github.com/dumbmatter/fakeIndexedDB

# Testing
<!--ONE-DOCS-HIDE start-->
[👈 Go to `README`](../../README.md)

[👆 Back to `Guides`](./README.md)
<!--ONE-DOCS-HIDE end-->

## 📖 Table of Contents

- [Unit Testing](#-unit-testing)
- [Integration Testing](#-integration-testing)

## Unit Testing

It's vital to lay out what we expect from our service worker through unit tests. Unlike
most testing libraries, the service worker has a special need for the right globals to
match as closely to actual implementations of the `ServiceWorkerGlobalScope`. APIs
like `Caches`, `CacheStorage`, `WindowClient`, `IndexedDB` and other browser interfaces
found in a `WebWorker`, we can use `npm` packages that are available in our ecosystem:

- [`sw-test-env`](sw-test-env)
- [`service-worker-mock`](service-worker-mock)
- [`fake-indexeddb`](fake-indexeddb)

These can be great tools to flesh out the behaviors desired from a service worker.
For our recipe, we'll be using the script below for our testing examples:

### With Jest

We've made a handy [Jest environment](jest-environment) that you can add to your configuration.
It's built on [`service-worker-mock`](service-worker-mock) and can be configured.

#### `jest.config.js`
```js
module.exports = {
  testMatch: ['__tests__/sw/*.spec.js'],
  testEnvironment: '@americanexpress/one-service-worker/jest.environment.js',
  testEnvironmentOptions: {
    target: 'service-worker',
    env: {
      NODE_ENV: 'production',
    },
  },
};
```

You can pass in a [Jest environment options](jest-environment-options) to this environment with
the keys `target` (`shared`, `service-worker`, `client`) and `env` (an object assigned
to `process.env`).

With the `one-service-worker` test environment, we can start testing
a service worker script in [`jest`][jest] with no manual setup required:

#### `/src/sw.js`

```javascript
import {
  on,
  skipWaiting,
  clientsClaim,
  cacheStrategy,
} from '@americanexpress/one-service-worker';

on('fetch', cacheStrategy());
on('install', skipWaiting());
on('activate', clientsClaim());
```

#### `/__tests__/sw.spec.js`
```js
const { addAll } = require('@americanexpress/one-service-worker');

describe('my service worker', () => {
  beforeEach(() => {
    jest.resetModules();

    // eslint-disable-next-line global-require
    require('../src/sw.js');
  });

  beforeAll(() => {
    jest.spyOn(self, 'skipWaiting');
    jest.spyOn(self.clients, 'claim');
  });

  it('should have listeners and run lifecycle events', async () => {
    expect.assertions(5);

    expect(self.listeners.install).toBeDefined();
    expect(self.listeners.activate).toBeDefined();
    expect(self.listeners.fetch).toBeDefined();

    await self.trigger('install');
    await self.trigger('activate');

    expect(self.skipWaiting).toHaveBeenCalled();
    expect(self.clients.claim).toHaveBeenCalled();
  });

  describe('caching', () => {
    beforeAll(async () => {
      await addAll(['/index.js']);
    });

    it('responds with correct response and does not call fetch', async () => {
      expect.assertions(2);

      const fetchEvent = new FetchEvent(
        type,
        parameters || {
          request: new Request('/index.js'),
        },
      );

      jest.spyOn(fetchEvent, 'respondWith');

      await self.trigger('fetch', fetchEvent);

      expect(fetchEvent.respondWith).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
```

## Integration Testing

To test in real browsers, we recommend using [`playwright`][playwright], you
can read up on [their documentation](playwright-docs). The example below
demonstrates basic usage of `playwright` using `chromium`:

```js
const { chromium } = require('playwright');

const createServer = () => {
  // eslint-disable-next-line global-require
  const express = require('express');

  const app = express();

  // ... add some routes

  const server = app.listen(3000);

  return { app, server };
};

(async function testing() {
  const { app, server } = createServer();

  const browser = await chromium.launch();
  const context = await browser.newContext();

  // we can use the minified library directly from node_modules to every page created
  // we can also use page (defined further below) instead of context here for per page usage

  await context.addInitScript({
    path: `${process.cwd()}/node_modules/@americanexpress/one-service-worker/index.min.js`,
  });

  // as the equivalent of opening a new tab, we use page to start

  const page = await context.newPage();

  // make sure to run your local development server

  await page.goto('http://localhost:3000', {
    waitUntil: 'load',
  });

  // to help us out, we can define some helpers to use in our test and add it to the document

  await page.addScriptTag({
    content: `
      async function register() {
        const registration = await window.oneServiceWorker.register('/sw.js', {
          scope: '/'
        });
        return registration;
      }

      async function unregister() {
        const result = await window.oneServiceWorker.unregister();
        return result;
      }`,
  });

  const getRegistrations = () =>
    page.evaluate(() => navigator.serviceWorker.getRegistrations());
  const getBrowserTargets = async () =>
    (await browser.targets()).map(t => t.type());

  await page.evaluate(`(async () => await register())()`);

  if ((await getRegistrations().length) !== 1) {
    throw new Error('there should be at least one registration and no more');
  }

  // once we have registered a worker, we can get the target and gather some insight on the service worker

  if ((await getBrowserTargets().includes('service_worker')) === false) {
    throw new Error('service worker is missing?');
  }

  //  to get a JSHandle of the worker, we can get the target and use it to access the handle

  const swTarget = await browser.waitForTarget(
    target => target.type() === 'service_worker',
  );
  const worker = await browser.serviceWorker(swTarget);
  const stringifiedWorker = await worker.evaluate(() => self.toString());

  if (stringifiedWorker !== '[object ServiceWorkerGlobalScope]') {
    throw new Error('huh?');
  }

  // once we are done, we can unregister the worker to clear it from the context

  await page.evaluate(`(async () => await unregister())()`);

  if ((await getRegistrations().length) !== 0) {
    throw new Error('there should be no registrations');
  }

  // once were done we can start cleaning up

  await page.close();
  await context.close();
  await browser.close();

  // finally, close the server

  server.close();
})();
```

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)
