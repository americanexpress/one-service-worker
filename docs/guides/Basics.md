# Service Worker Basics
<!--ONE-DOCS-HIDE start-->
[👈 Go to `README`](../../README.md)

[👆 Back to `Guides`](./README.md)
<!--ONE-DOCS-HIDE end-->

## 📖 Table of Contents

- [Basics](#-basics)
  - [Writing A Service Worker Script](#writing-a-service-worker-script)
  - [Registering A Service Worker](#registering-a-service-worker)
- [Runtime](#-runtime)
- [Middleware](#-middleware)

## Basics

There are a few considerations to take into account with the service worker:

- a secure origin is required to register a service worker, otherwise
`navigator.serviceWorker` will not be defined.
- the service worker runs on a separate thread than the main client application
that registers it. Unlike `WebWorker`s, the service worker thread is terminated
once its function is complete and executed on demand.
- There are two types of events for a service worker; lifecycle and functional.
When a service worker is first registered, it goes through `install` and follows
with the `activate` event.
- Events like `fetch`, `push`, `message` and other functional service worker
events wake up the service worker and respond to the event.

**Before starting, take note of the script names**
- `/client.js` will be representing the main thread
- `/sw.js` will be representing the service worker

### Writing A Service Worker Script

#### `/sw.js`
```javascript
import {
  on,
  skipWaiting,
  clientsClaim,
  cacheStrategy,
} from '@americanexpress/one-service-worker';

// skips waiting for the installation to continue
on('install', skipWaiting());

// claims the active clients (or open tabs)
on('activate', clientsClaim());

// we return anything found in the cache,
// any client side caching is available here
on('fetch', cacheStrategy());
```

### Registering A Service Worker

When it comes to the main thread, we can register the service worker from our app:

#### `/client.js`

```javascript
import { register } from '@americanexpress/one-service-worker';

export default function registerServiceWorker() {
  return register('/sw.js', {
    scope: '/',
  });
}
```

> Using `react`? [check out the Guide](./WithReact.md).

[☝️ Return To Top](#-service-worker-basics)

## Runtime

The runtime is how we progressively adapt to an execution context which the
`one-service-worker` library runs under. For example in the main thread, the
runtime helper functions will return what is supported and what was enabled
throughout the lifetime of execution (per thread, service worker and main).

Here are the environment checks exported from `runtime`:

```jsx
import {
  configure,
  isDevelopment,
  isEventsEnabled,
  isNonStandardEnabled,
  isNavigationPreloadEnabled,
  isServiceWorker,
  isServiceWorkerSupported,
  isNotificationSupported,
  isPushSupported,
  isBackgroundSyncSupported,
  isCacheStorageSupported,
  isIndexedDBSupported,
  isPermissionsSupported,
  isOffline,
} from '@americanexpress/one-service-worker';
```

## Configuration

The runtime configuration is a way to automatically dictate behavior of the library.
By default, configuration starts off like this:
```js
const config = {
  development: process.env.NODE_ENV === 'development',
  nonStandard: false,
  navigationPreload: false,
  events: true,
};
```

We can use configure, to enable events in this case:

```js
import { configure } from '@americanexpress/one-service-worker';

configure({
  navigationPreload: true,
});
```

## Examples of usage

A use case we can apply using these helpers is with how we can include `@americanexpress/one-service-worker`.
If we were to use code splitting to include the library based on service worker support, we can:

```js
import { isServiceWorkerSupported } from '@americanexpress/one-service-worker';

export default async function getOneServiceWorker() {
  if (isServiceWorkerSupported()) {
    const { register } = await import(
      '@americanexpress/one-service-worker/es/core'
    );
    return { register };
  }
  return {};
}
```

Here, we are checking for support and dynamically importing the register function if the
service worker is available in a given browser. The library was designed to segmented;
what this means is that we can import (and cherry pick) only what we need and run or import.

Another use case we can use is checking if caching is possible:

```jsx
import React from 'react';
import PropTypes from 'prop-types';

import { isCacheStorageSupported } from '@americanexpress/one-service-worker';

export default function Icon({ src, alt }) {
  React.useEffect(() => {
    if (src && isCacheStorageSupported()) {
      caches.open('images').then(cache => {
        cache.add(src);
      });
    }
  }, [src]);

  return <img src={src} alt={alt} />;
}

Icon.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
};

Icon.defaultProps = {
  src: '',
  alt: 'an image',
};
```

In the event that `CacheStorage` is supported in a given execution context, we can ensure our
caching of an icon for example.

[☝️ Return To Top](#-service-worker-basics)

## Middleware

Middleware are a major part of event handling in `one-service-worker`, which
are functions that get passed into event handlers.
They can be used to stack, sequence and control the flow of functionality.
For middleware, order matters and how middleware are composed will give
precedence to the start of a middleware stack.

### Using Handles

With middleware handlers (such as `onFetch`) which return a `Boolean` that
decides if the next middleware should be called (returning `false` or falsy value)
or if it was handled by that given middleware function (returning `true`).

For example, if we pass in a middleware function as the first in an array,
that middleware will decide if it exclusively handles the event or if it can
pass the event to the next middleware function in the array.

### Using Blocks

#### `sw.js` - Service Worker Thread

```js
import {
  // core API
  postMessage,
  unregister,
  on,
  // middleware
  onInstall,
  onActivate,
  onMessage,
  onFetch,
  appShell,
  cacheRoute,
  expiration,
  manifest,
  escapeHatchRoute,
  skipWaiting,
  clientsClaim,
} from '@americanexpress/one-service-worker';

const startUrl = '/index.html';

on('install', [skipWaiting()]);
on('activate', [clientsClaim()]);
on('fetch', [
  escapeHatchRoute(),
  appShell({
    route: startUrl,
  }),
  manifest({
    name: 'my_app',
    short_name: 'app',
    start_url: startUrl,
  }),
  cacheRouter({
    match: ({ request }) => request.url.endsWith('.js'),
    cacheName: 'JavaScript',
  }),
  expiration(),
]);

```

### Basics

```js
import { postMessage, on } from '@americanexpress/one-service-worker';

on(
  'message',
  // lights
  [
    // camera
    event => {
      console.log('data:', event.data);
    },
    // action
    event => {
      if (event.data.id === 'ping') {
        //  do something cool
        postMessage(
          {
            id: 'pong',
          },
          event.source,
        );
        // and confirm we handled the event by returning true
        return true;
      }
      return false;
    },
  ],
);

```

```js
import {
  messageContext,
  messenger,
  postMessage,
  on,
} from '@americanexpress/one-service-worker';

on('message', [
  messageContext(),
  messenger({
    ping: event => {
      event.waitUntil(postMessage({ id: 'pong' }, event.source));
    },
  }),
]);

```

[☝️ Return To Top](#-service-worker-basics)
