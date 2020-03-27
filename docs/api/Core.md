[sw-container]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer
[sw-controller]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/controller
[sw-get-registration]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/getRegistration
[sw-get-registrations]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/getRegistrations
[sw-register]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
[sw-registration]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
[sw-update]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update
[sw-unregister]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/unregister
[sw-worker]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker
[sw-post-message]: https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage
[sw-notification]: https://developer.mozilla.org/en-US/docs/Web/API/notification
[sw-show-notification]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
[sw-get-notifications]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/getNotifications
[sw-push-subscription]: https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription
[sw-push-manager]: https://developer.mozilla.org/en-US/docs/Web/API/PushManager
[sw-push-get-subscription]: https://developer.mozilla.org/en-US/docs/Web/API/PushManager/getSubscription
[sw-push-subscribe]: https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe
[sw-push-unsubscribe]: https://developer.mozilla.org/en-US/docs/Web/API/PushManager/unsubscribe
[sw-sync-registration]: https://developer.mozilla.org/en-US/docs/Web/API/SyncRegistration
[sw-sync-manager]: https://developer.mozilla.org/en-US/docs/Web/API/SyncManager
[sw-sync-register]: https://developer.mozilla.org/en-US/docs/Web/API/SyncManager/register
[sw-sync-get-tags]: https://developer.mozilla.org/en-US/docs/Web/API/SyncManager/getTags
[sw-spec-sync]: https://wicg.github.io/BackgroundSync/spec/
[sw-spec-push]: https://w3c.github.io/ServiceWorker/
[sw-spec-service-worker-nightly]: https://w3c.github.io/ServiceWorker/
[sw-spec-service-worker]: https://www.w3.org/TR/service-workers/
[sw-fresher-cache]: https://developers.google.com/web/updates/2019/09/fresher-sw

[handbook-docs]: ../../docs/Handbook.md

# Core

[👈 Go to `README`](../../README.md)

[👆 Back to `API`](./README.md)

## 📖 Table of Contents

- [Service Worker Container](#-service-worker-container)
  - [`getRegistration`](#-getRegistration)
  - [`getRegistrations`](#-getRegistrations)
  - [`register`](#-register)
- [Service Worker](#-service-worker)
  - [`getWorker`](#-getWorker)
  - [`postMessage`](#-postMessage)
- [Service Worker Registration](#-service-worker-registration)
  - [`update`](#-update)
  - [`unregister`](#-unregister)
  - [`escapeHatch`](#-escape-hatch)
  - [`getNotifications`](#-getNotifications)
  - [`showNotification`](#-showNotification)
- [Service Worker Push Manager](#-push-manager)
  - [`getSubscription`](#-getSubscription)
  - [`subscribe`](#-subscribe)
  - [`unsubscribe`](#-unsubscribe)
- [Service Worker Sync Manager](#-sync-manager)
  - [`registerTag`](#-registerTag)
  - [`getTags`](#-getTags)

## Service Worker Specification

[Living Standard][sw-spec-service-worker]

[Nightly][sw-spec-service-worker-nightly]

## [Service Worker Container][sw-container]

### [`getRegistration`][sw-get-registration]

Gets any existing registration that is claiming the caller.

```js
import { getRegistration } from '@americanexpress/one-service-worker';

export async function getActiveScope() {
  const registration = await getRegistration();

  if (registration) return registration.scope;

  return null;
}
```

**Parameters**

| Name    | Type     | Required | Description                                       |
| ------- | -------- | -------- | ------------------------------------------------- |
| `scope` | `String` | `false`  | The scope a given service worker is registered to |

**Returns**

[`Promise( ServiceWorkerRegistration )`][sw-registration]

&nbsp;

### [`getRegistrations`][sw-get-registrations]

Returns all given registrations registered to that origin.

```js
import { getRegistrations } from '@americanexpress/one-service-worker';

export async function logRegistrations() {
  const registrations = await getRegistrations();

  registrations.forEach(registration => console.log(registration));
}
```

**Returns**

[`Promise([ ServiceWorkerRegistration ])`][sw-registration]

&nbsp;

### [`register`][sw-register]

Registers the service worker. Has no effect on the service worker thread.

```js
import { register } from '@americanexpress/one-service-worker';

export async function registerServiceWorker() {
  const registration = await register('/sw.js', {
    scope: '/',
    updateViaCache: 'none',
  });

  return registration;
}
```

**Parameters**

| Name             | Type     | Required | Description                                                 |
| ---------------- | -------- | -------- | ----------------------------------------------------------- |
| `url`            | `String` | `true`   | The script url for the service worker script                |
| `options.scope`          | `String` | `false`  | The scope to register the service worker, defaults to `"/"` |
| `options.updateViaCache` | `String` | `false`  | Defines the updating behavior for the service worker script |

> `updateViaCache` expects only three possible values: [ `"none"`, `"all"`, `"imports"` ]. [(Read More)][sw-fresher-cache]

**Returns**

[`Promise( ServiceWorkerRegistration )`][sw-registration]

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)

&nbsp;

## [Service Worker][sw-worker]

### [`getWorker`][sw-worker]

Gets the controller of the worker claiming the window client.

```js
import { getWorker } from '@americanexpress/one-service-worker';

export async function getWorkerInfo() {
  const worker = await getWorker({ action, data });

  return {
    scriptURL: worker.scriptURL,
    state: worker.state,
  };
}
```

**Returns**

[`Promise( ServiceWorker )`][sw-worker]

&nbsp;

### [`postMessage`][sw-post-message]

Sends a message between the service worker and clients.

```js
import { postMessage } from '@americanexpress/one-service-worker';

export async function sendData(action = 'analytics', data) {
  await postMessage({ action, data });
}
```

**Parameters**

| Name       | Type       | Required | Description                                             |
| ---------- | ---------- | -------- | ------------------------------------------------------- |
| `message`  | `anything` | `false`  | Payload to send to the opposite corresponding recipient |
| `transfer` | `anything` | `false`  | Bridge between worker-client communication              |

**Returns**

`Promise( void )`

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)

&nbsp;

## [Service Worker Registration][sw-registration]

### [`update`][sw-update]

Requests `/{url-to-sw}.js` provided at registering and updates the service
worker if the script has changed.

```js
import { update } from '@americanexpress/one-service-worker';

export async function checkForUpdates() {
  await update();
}
```

**Returns**

`Promise( void )`

&nbsp;

### [`unregister`][sw-unregister]

Uninstalls the service worker.

```js
import { unregister } from '@americanexpress/one-service-worker';

export async function unregisterServiceWorker() {
  await unregister();
}
```

**Parameters**

| Name    | Type     | Required | Description                                       |
| ------- | -------- | -------- | ------------------------------------------------- |
| `scope` | `String` | `false`  | The scope a given service worker is registered to |

**Returns**

`Promise( void )`

&nbsp;

### `escapeHatch`

Uninstalls any registered service worker. Compared to `unregister`, this function will
remove all active registrations on the origin. In case you find yourself needing to
remove the service worker, the `escapeHatch` function can do that.

```js
import { escapeHatch } from '@americanexpress/one-service-worker';

export async function removeAllServiceWorkers() {
  await escapeHatch();
}
```

**Returns**

`Promise( void )`

&nbsp;

### [`getNotifications`][sw-get-notifications]

Gets the current active notifications. This function is useful in-app,
when native toasters or notification UI can display the updates. Take
the opportunity to organize your notifications and match `notification.tag`
to group them as one.

```js
import { getNotifications } from '@americanexpress/one-service-worker';

export async function closeAllNotifications() {
  const notifications = await getNotifications();

  return notifications.map(note => note.close());
}
```

**Returns**

[`Promise( [ Notification ] )`][sw-notification]

&nbsp;

### [`showNotification`][sw-show-notification]

Display a native notification from the browser. This can be called at anytime,
without a subscription needed, so long as the client issues it.
This function is used in the default behavior for on `push` events.

```js
import { showNotification } from '@americanexpress/one-service-worker';

export async function showPromotionNotification() {
  const title = 'New Shoes';
  const options = { body: 'Check it out!', vibrate: [200, 300] };

  const note = await showNotification(title, options);

  return note;
}
```

**Parameters**

| Name      | Type     | Required | Description                              |
| --------- | -------- | -------- | ---------------------------------------- |
| `title`   | `String` | `false`  | The top text displayed in a notification |
| `options` | `Object` | `false`  | Notification Options                     |

**Returns**

[`Promise( Notification )`][sw-notification]

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)

&nbsp;

## [Push Manager][sw-push-manager]

[Read the spec][sw-spec-push]

### [`getSubscription`][sw-push-get-subscription]

Gets any existing subscription.

```js
import { getSubscription } from '@americanexpress/one-service-worker';

export async function subscribeToPush() {
  const subscription = await getSubscription();

  if (subscription) return subscription;

  return subscribe({
    applicationServerKey: '',
  });
}
```

**Returns**

[`Promise( PushSubscription )`][sw-push-subscription]

&nbsp;

### [`subscribe`][sw-push-subscribe]

Creates a unique subscription for the browser. The subscription
is then used by the server to push notifications to the
service worker.

> Only supported by Chrome and Firefox at the time of writing.

```js
import { subscribe } from '@americanexpress/one-service-worker';

const getApplicationServerKey = async () => {
  const response = await fetch('/subscribe');
  const key = await response.text();
  return key;
};

export async function createSubscription() {
  const options = {
    userVisibleOnly: true,
    applicationServerKey: getApplicationServerKey(),
  };

  const subscription = await subscribe(options);

  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription }),
  });

  return subscription;
}
```

**Parameters**

| Name                           | Type                  | Required | Description                                   |
| ------------------------------ | --------------------- | -------- | --------------------------------------------- |
| `options.userVisibleOnly` | `Boolean` | `false` | Flag to send only user visible notifications |
| `options.applicationServerKey` | `Uint8Array|String` | `true` | VAPID public key used to decrypt notifications on the client |

> Keep in mind, the `applicationServerKey` is the public key in a VAPID key pair.
> Check out the [Web Push Recipe][handbook-docs] for an example implementation.

**Returns**

[`Promise( PushSubscription )`][sw-push-subscription]

&nbsp;

### [`unsubscribe`][sw-push-unsubscribe]

Removes the active subscription.

```js
import {
  unsubscribe,
  getSubscription,
} from '@americanexpress/one-service-worker';

export async function removeSubscription() {
  const subscription = await getSubscription();

  const result = await unsubscribe();

  if (result === true) {
    await fetch('/subscribe', {
      method: 'DELETE',
      body: JSON.stringify({ subscription }),
    });
  }

  return result;
}
```

**Returns**

`Promise( Boolean )`

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)

&nbsp;

## [Sync Manager][sw-sync-manager]

### ⚠️ **Caution - Non Standard**

`sync`: Currently, the API is not part of the official spec and these
methods are non standard in their support. One Service Worker handles this
without error, `registerTag` and `getTag` should not be relied on, but considered
a progressive enhancement.

[Read the incubator spec][sw-spec-sync]

### [`registerTag`][sw-sync-register]

Registers a `sync` tag.

```js
import { registerTag } from '@americanexpress/one-service-worker';

export async function tag() {
  const tagRegistration = await registerTag('articles');

  return tagRegistration;
}
```

**Parameters**

| Name  | Type     | Required | Description                                     |
| ------| -------- | -------- | ----------------------------------------------- |
| `tag` | `String` | `true`   | A given string to match within the `sync` event |

**Returns**

[`Promise( SyncRegistration )`][sw-sync-registration]

&nbsp;

### [`getTags`][sw-sync-get-tags]

Returns the active `sync` registrations.

```js
import { getTags } from '@americanexpress/one-service-worker';

export async function getAllTags() {
  const tags = await getTags();

  return tags;
}
```

**Returns**

[`Promise( [ SyncRegistration ] )`][sw-sync-registration]

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)