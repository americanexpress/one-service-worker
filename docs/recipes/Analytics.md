# Analytics

[👈 Go to `README`](../../README.md)

[👆 Back to `Recipes`](./README.md)

### Overview

#### `config.js`

```js
// what the app and server are currently using
export const analyticsEndpoint = '/beacon';

// what we can use as an alias
export const analyticsFacadeEndpoint = '/analytics';

// used to trigger the batching and dispatch of analytics
export const analyticsOffloadEndpoint = '/sw/_analytics_offload';

// the cache name we will be utilizing
export const analyticsCacheName = 'analytics';

```

#### `sw.js` - Service Worker Thread

```js
import {
  isPushSupported,
  showNotification,
  unregister,
  onInstall,
  onActivate,
  onFetch,
  onPush,
} from '@americanexpress/one-service-worker';

import {
  analyticsEndpoint,
  analyticsFacadeEndpoint,
  analyticsOffloadEndpoint,
  analyticsCacheName,
} from './config.js';

// bootstrap
self.addEventListener('install', onInstall());
self.addEventListener('activate', onActivate());

// helpers

function getCacheEntries(cache) {
  return cache.keys().then(requests => {
    cache
      .matchAll(requests.map(request => request.clone()))

      .then(responses => [
        new Map([
          responses.map((response, index) => [requests[index], response]),
        ]),
        requests,
        responses,
      ]);
  });
}

function createAcceptedResponse() {
  return new Response(null, {
    status: 202,
    statusText: 'OK',
  });
}

const dispatchAnalytics = events => {
  return fetch(analyticsEndpoint, {
    body: JSON.stringify({
      events,
    }),
  });
};

const analyticsMiddleware = event => {
  switch (event.request.url) {
    default:
      // if the event does not match, we bail
      return false;
    // we can aggregate our analytics data from the cache
    // and send a batch of events every once in a while
    case analyticsOffloadEndpoint: {
      event.waitUntil(
        Promise.all(
          caches.open(analyticsCacheName).then(cache => {
            return getCacheEntries(cache).then(([entries]) => {
              const events = [];

              entries.forEach(([request, response]) => {
                event.waitUntil(cache.delete(request));
                events.push(response.json());
              });

              return Promise.all(events).then(dispatchAnalytics);
            });
          }),
        ),
      );
      break;
    }
    // for all our analytics endpoints, we can store them to be queued
    case analyticsFacadeEndpoint:
    case analyticsEndpoint: {
      event.waitUntil(
        caches.open(analyticsCacheName).then(cache => {
          const response = new Response({
            timestamp: Date.getTime(),
            ...JSON.parse(event.request.clone().body),
          });
          return cache.put(event.request, response);
        }),
      );
    }
  }

  // we send over confirmation response
  event.respondWith(createAcceptedResponse());

  return true;
};

self.addEventListener('fetch', onFetch([analyticsMiddleware]));

// we can check the runtime for support
if (isPushSupported()) {
  const pushMiddleware = event => {
    const { id, notification } = event.data.json();

    let eventName;

    switch (id) {
      default: {
        if (notification) {
          eventName = 'push-notification:notification';
          event.waitUntil(
            showNotification(notification.title, notification.options),
          );
          break;
        }
        return false;
      }
      case 'module-update': {
        eventName = 'push-notification:module-update';
        event.waitUntil(
          Promise.all([
            // update a module and its dependencies
          ]),
        );
        event.waitUntil(showNotification('Module Update'));
        break;
      }
      case 'escape-hatch': {
        eventName = 'push-notification:escape-hatch';
        // emergency push to unregister service worker
        event.waitUntil(unregister());
        event.waitUntil(showNotification('Uninstalling Service Worker'));
        break;
      }
    }

    if (eventName) {
      event.waitUntil(
        fetch(
          new Request(analyticsFacadeEndpoint, {
            body: JSON.stringify({
              event,
            }),
          }),
        ),
      );
      return true;
    }

    return false;
  };

  self.addEventListener('push', onPush([pushMiddleware]));
}

```

#### `client.js` - Main Thread

```js
import {
  // runtime
  isPushSupported,
  isSyncSupported,
  //  core API
  register,
  subscribe,
  registerTag,
  on,
  registerTagEvent,
} from '@americanexpress/one-service-worker';

import { analyticsFacadeEndpoint, analyticsOffloadEndpoint } from './config.js';

const subscribeEndpoint = '/subscribe';

// helpers

const offloadAnalytics = () => fetch(analyticsOffloadEndpoint);

const sendAnalytics = ({ event, data }) =>
  fetch(
    new Request(analyticsFacadeEndpoint, {
      body: JSON.stringify({
        event,
        data,
      }),
    }),
  );

const sendSubscription = subscription =>
  fetch(
    new Request(subscribeEndpoint, {
      method: 'POST',
      body: JSON.stringify(subscription),
    }),
  );

// to install the service worker, we have to register the script
register('/sw.js', {
  scope: '/',
  updateViaCache: 'none',
})
  .catch(e => console.error(e))
  .then(() => {
    // set up our analytics interval to every 5 minutes
    setInterval(offloadAnalytics, 1000 * 60 * 5);

    document
      .getElementById('analytics-offload-button')
      .addEventListener('click', () => {
        offloadAnalytics();
      });

    if (isPushSupported()) {
      document
        .getElementById('subscribe-button')
        .addEventListener('click', () => {
          // after registration and once clicked, we subscribe the user
          subscribe({
            applicationServerKey: 'your-app-key',
            userVisibleOnly: true,
          }).then(subscription => {
            // once subscribed, send your users subscription to your server for keeping
            sendSubscription(subscription);
            sendAnalytics({
              event: 'push-subscribe',
            });
          });
        });
    }

    if (isSyncSupported()) {
      on(registerTagEvent, tag => {
        /* update state if needed */
        sendAnalytics({
          event: 'sync-tag',
          data: {
            tag,
          },
        });
      });

      document.getElementById('sync-server').addEventListener('click', () => {
        const tag = document.getElementById('sync-select-tag').value;
        registerTag(tag)
          .catch(console.error)
          .then(syncRegistration => {
            console.log('syncRegistration: ', syncRegistration);
            sendAnalytics({
              event: 'sync-tag-registration',
              data: {
                tag,
              },
            });
          });
      });
    }
  });

```

[☝️ Return To Top](#-analytics)