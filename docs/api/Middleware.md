[worker-global-scope]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope
[worker-skip-waiting]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
[worker-clients-claim]: https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim

[cache-clear-docs]: ../cache/README.md#clear

# Service Worker Middleware

[👈 Go to `README`](../../README.md)

[👆 Back to `API`](./README.md)

## 📖 Table of Contents

- [`Middleware Handlers`](#-middleware-handlers)
  - [`onInstall`](#-onInstall)
  - [`onActivate`](#-onActivate)
  - [`onFetch`](#-onFetch)
  - [`onMessage`](#-onMessage)
  - [`onPush`](#-onPush)
- [`Middleware Blocks`](#-middleware-blocks)
  - [`skipWaiting`](#-skipwaiting)
  - [`clientsClaim`](#-clientsclaim)
  - [`escapeHatchRoute`](#-escapehatchroute)
  - [`navigationPreloadActivation`](#-navigationpreloadactivation)
  - [`navigationPreloadResponse`](#-navigationpreloadresponse)
  - [`manifest`](#-manifest)
  - [`appShell`](#-appshell)
  - [`expiration`](#-expiration)
  - [`cacheRouter`](#-cacherouter)
  - [`cacheStrategy`](#-cachestrategy)
  - [`cacheBusting`](#-cachebusting)
  - [`precache`](#-precache)

## Middleware Handlers

### `onInstall`

Calls [`skipWaiting`][worker-skip-waiting].

```js
import { onInstall } from '@americanexpress/one-service-worker';

self.addEventListener(
  'install',
  onInstall([
    event => {
      // do something cool... setup your service worker
    },
  ]),
);
```

**Parameters**

| Name         | Type         | Required | Description                            |
| ------------ | ------------ | -------- | -------------------------------------- |
| `middleware` | `[Function]` | `false`  | Middleware functions for install event |

**Returns**
An `event handler function` that use the passed in `middleware` array.

&nbsp;

### `onActivate`

Calls [`clients.claim`][worker-clients-claim].

```js
import { onActivate } from '@americanexpress/one-service-worker';

self.addEventListener(
  'activate',
  onActivate([
    event => {
      // do something cool... delete old caches, setup new ones
      return false;
    },
  ]),
);
```

**Parameters**

| Name         | Type         | Required |           Description                   |
| ------------ | ------------ | -------- | --------------------------------------- |
| `middleware` | `[Function]` | `false`  | Middleware functions for activate event |

**Returns**

An `event handler function` with the passed in `activateMiddleware`

&nbsp;

### `onFetch`

Sets up cache matching. `fetchMiddleware` is called with `event` to intercept as the entry.
Here the registered resource caches are called for matches, and handled if caught.

```javascript
import { onFetch } from '@americanexpress/one-service-worker';

self.addEventListener(
  'fetch',
  onFetch([
    event => {
      if (event.request.mode === 'navigate')
        console.log('navigating to: ', event.request.url);
      // let the browser handle the request
      return false;
    },
  ]),
);
```

**Parameters**

| Name         | Type         | Required | Description                          |
| ------------ | ------------ | -------- | ------------------------------------ |
| `middleware` | `[Function]` | `false`  | Middleware functions for fetch event |

**Returns**

An `event handler function` with the passed in `fetchMiddleware`.

&nbsp;

### `onMessage`

Enables the `oneServiceWorkerClient` to communicate with `oneServiceWorker`.
`messageMiddleware` is called for all messages that are not part of
`oneServiceWorker`'s system messages.

```js
import { onMessage } from '@americanexpress/one-service-worker';

self.addEventListener(
  'message',
  onMessage([
    event => {
      if (event.data) {
        // do something cool... respond to a message sent to the worker
        return true;
      }
      return false;
    },
  ]),
);
```

**Parameters**

| Name         | Type         | Required | Description                            |
| ------------ | ------------ | -------- | -------------------------------------- |
| `middleware` | `[Function]` | `false`  | Middleware functions for message event |

**Returns**

An `event handler function` with the passed in `messageMiddleware`

&nbsp;

### `onPush`

Listens to incoming push notifications coming into `oneServiceWorker`. Default
handling will `showNotification`.

```js
import { onPush } from '@americanexpress/one-service-worker';

self.addEventListener(
  'push',
  onPush([
    event => {
      const notification = event.data.json();
      if (notification.data.tag === 'update-component') {
        // do something cool... handle component update and return true
        return true;
      }
      // otherwise handled as notification
      return false;
    },
  ]),
);
```

**Note**
The expected payload for the default handler:

```json
{
  "title": "title-text",
  "options": { "body": "message body", "...other-keys": "to pass to options" }
}
```

**Parameters**

| Name         | Type         | Required | Description                         |
| ------------ | ------------ | -------- | ----------------------------------- |
| `middleware` | `[Function]` | `false`  | Middleware functions for push event |

**Returns**

An `event handler function` with the passed in `pushMiddleware`

&nbsp;

### `onSync`

Listens to incoming sync tag invocations.

```js
import { onSync } from '@americanexpress/one-service-worker';

self.addEventListener(
  'sync',
  onSync([
    event => {
      if (event.tag === 'cache') {
        // do something cool... synchronize the cache for example
        return true;
      }
      return false;
    },
  ]),
);
```

**Parameters**

| Name         | Type         | Required | Description                         |
| ------------ | ------------ | -------- | ----------------------------------- |
| `middleware` | `[Function]` | `false`  | Middleware functions for sync event |

**Returns**

An `event handler function` with the passed in `syncMiddleware`.

&nbsp;

## Middleware Blocks

### `skipWaiting`

Calls [`self.skipWaiting`][worker-skip-waiting] and progresses the service worker into the
`activating` state. Would be placed in the `install` event.

```js
import { on, skipWaiting } from '@americanexpress/one-service-worker';

on('install', [
  skipWaiting(),
]);
```

**Returns**

`Function`

&nbsp;

### `clientsClaim`

Calls [`self.clients.claim`][worker-clients-claim], and claims the active clients if controlled by another service worker.
Would be placed in the `activate` event.

```js
import { on, clientsClaim } from '@americanexpress/one-service-worker';

on('install', [
  clientsClaim(),
]);
```

**Returns**

`Function`

&nbsp;

### `escapeHatchRoute`

Creates a fetch route that if matched, will unregister the service worker controlling the client.

```js
import { on, escapeHatchRoute } from '@americanexpress/one-service-worker';

on('fetch', [
  escapeHatchRoute({
    route: '/__sw/__escape',
    response: new Response(null, { status: 200 }),
  }),
]);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options.route` | `String|URL` | `false` | Route to match to activate escape hatch |
| `options.response` | `Response` | `false` | Response to use when the route is hit |
| `options.clearCache` | `Boolean` | `false` | Opt in to clear the entire cache on unregistering |

**Returns**

`Function`

&nbsp;

### `navigationPreloadActivation`

Enables `navigationPreload` to be used by a service worker on the `fetch` event, if enabled
in configuration.

```js
import { on, navigationPreloadActivation } from '@americanexpress/one-service-worker';

on('activate', [
  navigationPreloadActivation(),
]);
```

**Returns**

`Function`

&nbsp;

### `navigationPreloadResponse`

Handles a `navigationPreload` response when enabled and accepts a function
to fallback on if unavailable.

```js
import { on, navigationPreloadResponse } from '@americanexpress/one-service-worker';

on('fetch', [
  navigationPreloadResponse(event => fetch(event.request.clone())),
]);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fallback` | `Function` | `false` | Function to use if preload navigation response was not found |

**Returns**

`Function`

&nbsp;

### `manifest`

Serves a webmanifest within the service worker using a definition inside the service worker script,
when a matching request is made for the provided `route`.

```js
import { on, manifest } from '@americanexpress/one-service-worker';

on('fetch', [
  manifest({
    name: 'my-app',
    short_name: 'app',
    start_url: '/index.html',
  }, '/manifest.webmanifest'),
]);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `webmanifest` | `Object` | `false` | A web manifest |
| `route` | `String|Request` | `false` | The route to match for the webmanifest |

**Returns**

`Function`

&nbsp;

### `appShell`

While navigating, `appShell` will fetch the `html` document and cache it on every
navigation request. Once offline, the middleware will respond with the last cached
`html` document in the cache.

```js
import { on, appShell } from '@americanexpress/one-service-worker';

on('fetch', [
  appShell({
    route: '/index.html',
    cacheName: 'app-shell',
  }),
]);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options.route` | `String|Request` | `false` | The route to match for the webmanifest |
| `options.cacheName` | `String` | `false` | The cache name to put the `html` response |

**Returns**

`Function`

&nbsp;

### `expiration`

Manages the lifespan of cached items within an event context; it
uses context to interact with other middleware in an event stack.
If a `request` is found in context, will create a `meta-data` record for the
given URL and will dispose of any items in cache if it expired.

> The default `maxAge` used is a month.

```js
import { on, expiration, cacheRouter } from '@americanexpress/one-service-worker';

on('fetch', [
  cacheRouter({
    // we tell our cacheRouter to cache everything
    match: () => true,
  }),
  // once cache router matches a route,
  // it adds it to the event context
  // expiration intercepts that and acts on it
  expiration({
    // 30 days in milliseconds
    maxAge: 1000 * 60 * 60 * 24 * 30
  }),
]);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options.maxAge` | `Number` | `false` | Route to match to activate escape hatch |

**Returns**

`Function`

&nbsp;

### `cacheRouter`

Matches a `fetch` `Request` based on a `match` option and caches the response
to be served from the cache afterwards. Supports offline.

```js
import { on, cacheRouter } from '@americanexpress/one-service-worker';

on('fetch', [
  cacheRouter({
    match: /.js$/,
    cacheName: 'javascript',
    fetchOptions: {}
  }),
]);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options.match` | `Function|RegExp` | `false` | method for matching a fetch event |
| `options.cacheName` | `String` | `false` | cache name to use for caching |
| `options.fetchOptions` | `Object` | `false` | options to pass into `fetch` calls |

**Returns**

`Function`

&nbsp;

### `cacheBusting`

Provides a mean to manage the cache using [`clear`][cache-clear-docs], ideally during lifecycle events
like `install` or `activate`.

```js
import { on, cacheBusting } from '@americanexpress/one-service-worker';

on('activate', [
  cacheBusting(
    () => true,
    () => true,
  ),
]);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `invalidateRequest` | `Function` | `false` | Function that is called with Requests for returning a Boolean |
| `invalidateCache` | `Function` | `false` | Function that is called with cacheName for returning a Boolean |

**Returns**

`Function`

&nbsp;

### `cacheStrategy`

Serves any `fetch` `Request` from cache if it is found, otherwise falls back to using `fetch`.
The middleware will override falling back to default browser handling of a request.

```js
import { on, cacheStrategy } from '@americanexpress/one-service-worker';

on('fetch', [
  cacheStrategy(),
]);
```

**Returns**

`Function`

&nbsp;

### `precache`

Pre-caches resources to be available for matching. When coupled with other middleware like `cacheStrategy`,
it will be available from the cache.

```js
import { on, precache } from '@americanexpress/one-service-worker';

on('install', [
  precache([
    '/styles.css',
    new Request('/index.js'),
  ], {
    cacheName: 'assets',
  }),
]);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `requests` | `[String|Request]` | `false` | Array of requests to precache |
| `options.cacheName` | `String` | `false` | cache name to use for caching |

**Returns**

`Function`

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)
