# Runtime

[👈 Go to `README`](../../README.md)

[👆 Back to `API`](./README.md)

## 📖 Table of Contents

- [`Configuration`](#-configuration)
  - [`configure`](#-configure)
  - [`getConfig`](#-getConfig)
  - [`isDevelopment`](#-isdevelopment)
  - [`isDevelopment`](#-isdevelopment)
  - [`isEventsEnabled`](#-iseventsenabled)
  - [`isNonStandardEnabled`](#-isnonstandardenabled)
  - [`isNavigationPreloadEnabled`](#-isnavigationpreloadenabled)
- [`Environment`](#-configuration)
  - [`isServiceWorker`](#-isserviceworker)
  - [`isServiceWorkerSupported`](#-isserviceworkersupported)
  - [`isNotificationSupported`](#-isnotificationsupported)
  - [`isPushSupported`](#-ispushsupported)
  - [`isBackgroundSyncSupported`](#-isbackgroundsyncsupported)
  - [`isCacheStorageSupported`](#-iscachestoragesupported)
  - [`isIndexedDBSupported`](#-isindexeddbsupported)
  - [`isPermissionsSupported`](#-ispermissionssupported)
  - [`isOffline`](#-isoffline)

## Configuration

### `configure`

Allows configuring the runtime and toggling functionality.

```js
import { configure } from '@americanexpress/one-service-worker';

// disables everything
const newConfig = configure({
  development: false,
  events: false,
  nonStandard: false,
  navigationPreload: false,
});
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options.development` | `Boolean` | `false` | Toggles the library development mode |
| `options.events` | `Boolean` | `false` | Toggles events functionality |
| `options.nonStandard` | `Boolean` | `false` | Toggles Non Standard methods functionality |
| `options.navigationPreload` | `Boolean` | `false` | Toggles navigation preload functionality |

**Returns**

`Object`

&nbsp;

### `getConfig`

Retrieves the current configuration from memory. Currently, both threads operate
with distinct configurations and relies on preset configuration definitions to
share the same configuration between the two threads.

```js
import { getConfig } from '@americanexpress/one-service-worker';

const {
  development,
  events,
  nonStandard,
  navigationPreload,
} = getConfig();
```

**Returns**

`Object`

&nbsp;

### `isDevelopment`

Checks if the library is in development mode. The default value set comes
from `process.env.NODE_ENV` however it can be configured during runtime.

```js
import { isDevelopment, on } from '@americanexpress/one-service-worker';

if (isDevelopment()) {
  on('subscribe', (subscription) => {
    console.log(subscription);
  });
}
```

**Returns**

`Boolean`

&nbsp;

### `isEventsEnabled`

Checks if the library has enabled events. The default value is `true`
and can be configured during runtime.
If disabled, calling event functionality will have no effect.

```js
import { isEventsEnabled, on } from '@americanexpress/one-service-worker';

if (isEventsEnabled()) {
  on('registration', [
    () => console.log('service worker registered'),
  ]);
}
```

**Returns**

`Boolean`

&nbsp;

### `isNonStandardEnabled`

Checks if the library has non standard functionality (like `sync`) is enabled.
The default value is `true` and can be configured during runtime.
If disabled, calling non standard functionality will have no effect.

```js
import { isNonStandardEnabled, registerTag } from '@americanexpress/one-service-worker';

if (isNonStandardEnabled()) {
  (async function syncTag() {
    await registerTag('my-sync-tag');
  })();
}
```

**Returns**

`Boolean`

&nbsp;

### `isNavigationPreloadEnabled`

Checks if the library has `navigationPreload` enabled, however it requires implementation
to take effect. The default value is `true` and can be configured during runtime.
If disabled, calling functionality for `navigationPreload` will have no effect.

```js
import { isNavigationPreloadEnabled, on, navigationPreloadActivation } from '@americanexpress/one-service-worker';

if (isNavigationPreloadEnabled()) {
  on('activate', [
    navigationPreloadActivation(),
  ]);
}
```

**Returns**

`Boolean`

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)

&nbsp;

## Environment

### `isServiceWorker`

Checks to see if the execution context is running in the service worker or not.

```js
import { on, isServiceWorker, postMessage } from '@americanexpress/one-service-worker';

// same file for building symmetric messaging between both threads
if (isServiceWorker()) {
  // service worker thread
  on('message', (event) => {
    if (event.data === 'ping') {
      postMessage('pong');
    }
  });
} else {
  // client thread
  on('message', (event) => {
    if (event.data === 'pong') {
      console.log('message delivered to service worker with ack');
    }
  });
  on('registration', () => postMessage('ping'));
}
```

**Returns**

`Boolean`

&nbsp;

### `isServiceWorkerSupported`

Checks to see if the service worker is supported; will always be true within the service worker.

```js
import { isServiceWorkerSupported, register } from '@americanexpress/one-service-worker';

if (isServiceWorkerSupported()) {
  (async function registerIfAvailable() {
    await register('/sw.js', { scope: '/' });
  })();
}
```

**Returns**

`Boolean`

&nbsp;

### `isNotificationSupported`

Checks to see if `Notification`s is available.

```js
import { isNotificationSupported, showNotification } from '@americanexpress/one-service-worker';

if (isNotificationSupported()) {
  (async function notifyIfAvailable() {
    await showNotification('hi there!');
  })();
}
```

**Returns**

`Boolean`

&nbsp;

### `isPushSupported`

Checks to see if `PushManager` is available.

```js
import { isPushSupported, subscribe } from '@americanexpress/one-service-worker';

if (isPushSupported()) {
  (async function subscribeToPushIfAvailable() {
    await subscribe({ applicationServerKey: 'app-key' });
  })();
}
```

**Returns**

`Boolean`

&nbsp;

### `isBackgroundSyncSupported`

Checks to see if `BackgroundSync` is available.

```js
import { isBackgroundSyncSupported, registerTag } from '@americanexpress/one-service-worker';

if (isBackgroundSyncSupported()) {
  (async function registerTagIfAvailable() {
    await registerTag('blog-posts');
  })();
}
```

**Returns**

`Boolean`

&nbsp;

### `isCacheStorageSupported`

Checks to see if `CacheStorage` is available.

```js
import { isCacheStorageSupported, add } from '@americanexpress/one-service-worker';

if (isCacheStorageSupported()) {
  (async function cacheDocumentIfAvailable() {
    await add('/cache-this-please.html');
  })();
}
```

**Returns**

`Boolean`

&nbsp;

### `isIndexedDBSupported`

Checks to see if `IndexedDB` is available.

```js
import { isIndexedDBSupported } from '@americanexpress/one-service-worker';

if (isIndexedDBSupported()) {
  console.log('use indexedDB...');
}
```

**Returns**

`Boolean`

&nbsp;

### `isPermissionsSupported`

Checks to see if `Permissions` is available.

```js
import { isPermissionsSupported } from '@americanexpress/one-service-worker';

if (isPermissionsSupported()) {
  (async function checkPushPermissions() {
    const result = await navigator.permissions.query({ name: 'push', userVisibleOnly: true });
    // do something based on the result
  })();
}
```

**Returns**

`Boolean`

&nbsp;

### `isOffline`

Checks to see if `navigator.onLine` is not true.

```js
import { on, isOffline, match } from '@americanexpress/one-service-worker';

on('fetch', event => {
  if (isOffline()) {
    event.respondWith(match(event.request));
  }
});
```

**Returns**

`Boolean`

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)
