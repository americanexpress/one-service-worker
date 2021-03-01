[web-push-nodejs]: https://github.com/web-push-libs/web-push

# Web Push
<!--ONE-DOCS-HIDE start-->
[👈 Go to `README`](../../README.md)

[👆 Back to `Recipes`](./README.md)
<!--ONE-DOCS-HIDE end-->

**Before starting, take note of the script names**
- `/sw.js` will be the service worker script
- `/client.js` will be the main thread
- `/server.js` will be the server-side

### Service Worker

For web push, our service worker can simply be:

`/sw.js`
```js
import {
  on,
  skipWaiting,
  clientsClaim,
  showNotification,
} from '@americanexpress/one-service-worker';

// skips waiting for the installation to continue
on('install', skipWaiting());

// claims the active clients (or open tabs)
on('activate', clientsClaim());

on('push', event => {
  const { title, options } = event.data.json();
  event.waitUntil(showNotification(title, options));
});
```

### Client

To coordinate our client-side with the service worker and the server, we use these high level methods:

`/client.js`
```js
import {
  register,
  subscribe,
  unsubscribe,
  getSubscription,
} from '@americanexpress/one-service-worker';
import {
  getApplicationServerKey,
  postSubscription,
  deleteSubscription,
  sendNotification,
} from './push-api.js';

// Combining our wrapped server methods with `one-service-worker`,
// we tie in the necessary communication to our push server and update
// the server with our subscription / or lack thereof:

export async function registerServiceWorkerAndSubscribe() {
  // Before we subscribe to anything, we need to register a service worker:
  await register('/sw.js', { scope: '/' });
}

export async function subscribeToPush() {
  // We get the public key used to sign push notifications from the server:
  const applicationServerKey = await getApplicationServerKey();
  // In modern browsers, this will require user input before calling subscribe:
  const subscription = await subscribe({ applicationServerKey });
  // We send our subscription to the server for tracking:
  await postSubscription(subscription);
  return subscription;
}

export async function unsubscribeFromPush() {
  // Before we remove the subscription, we grab its reference:
  const subscription = await getSubscription();
  // Afterwards, we unsubscribe as normal:
  await unsubscribe();
  // We alert the server that the user has unsubscribed:
  await deleteSubscription(subscription);
  return subscription;
}

export async function sendPushNotification(notification) {
  // To send a notification from the client-side, we can dispatch this http request that will generate
  // a push notification using the subscription on the client:
  const subscription = await getSubscription();
  await sendNotification(subscription, notification);
}
```

For client-side communication with the push server, we create some helpers to keep
things in sync:

`/push-api.js`
```js
// Our methods here are used to sync the push server with the client subscription state,
// as well as sending push notifications from the client:
export async function getApplicationServerKey() {
  const response = await fetch('/subscribe');
  const applicationServerKey = await response.text();
  return applicationServerKey;
}

export async function postSubscription(subscription) {
  const response = await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription }),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
  return response.status === 202;
}

export async function deleteSubscription(subscription) {
  const response = await fetch('/subscribe', {
    method: 'DELETE',
    body: JSON.stringify({ subscription }),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
  return response.status === 202;
}

export async function sendNotification(subscription, notification) {
  const response = await fetch('/dispatch', {
    method: 'POST',
    body: JSON.stringify({ subscription, notification }),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
  return response.status === 202;
}
```

### Push Server

To create a simple push service for clients to use, we start by configuring our service.
Persisting our config allows us to reuse the same publicKey (applicationServerKey) and
privateKey for existing subscriptions. It is vital to keep track of keys if the push service
whishes to send push notifications to subscriptions created with a given key. without the
ability to get our past keys, our push will fail and will require the user to resubscribe.

This example uses the [`web-push`][web-push-nodejs] package.

`/server/push.js`
```js
import fs from 'fs';
import path from 'path';
import url from 'url';
import webPush from 'web-push';

export function createWebPushConfig({ port, encoding, gcmKey }) {
  // To persist our config/keys across restarts, we will rely on writing the configuration to disk.
  // Ideally, we would include this as a volume in a Docker image if containerizing, otherwise it will be lost.
  // Here we create a path where the file will be:
  const configPath = path.join(__dirname, 'push-config.json');
  let config;

  // We check if the file exists for us to read and set our runtime config:
  if (fs.existsSync(configPath)) {
    const json = fs.readFileSync(configPath).toString();
    config = JSON.parse(json);
  } else {
    // Otherwise, we create the configuration:
    // We generate public/private VAPID keys used to sign outbound push notifications (with private key)
    // and use the public key to distribute publicly as `applicationServerKey`:
    const keys = webPush.generateVAPIDKeys();
    // `mailto` is sent with every push notification in the event the push service requires to contact us:
    const mailto = `mailto: push@localhost:${port}`;
    // The content coding is tied to the AES encryption, we can use subscription.supportedContentEnconding to
    // correctly set this value as well:
    const contentEncoding = encoding || 'aes128gcm' || 'aesgcm';
    // gcmAPIKey provides non-standard (legacy) support for older Chrome browsers,
    // this key needs to live in the web app manifest:
    const gcmAPIKey = gcmKey || '';

    // the VAPID details are used by `web-push` to create the notification:
    const vapidDetails = {
      subject: mailto,
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
    };

    config = {
      keys,
      mailto,
      contentEncoding,
      gcmAPIKey,
      vapidDetails,
    };

    // We write the configuration to disk once we create it:
    fs.writeFileSync(configPath, JSON.stringify(config, undefined, 2));
  }

  return config;
}

export function createWebPush({ port, proxy = '', encoding, gcmKey, verbose }) {
  const {
    keys,
    mailto,
    contentEncoding,
    gcmAPIKey,
    vapidDetails,
  } = createWebPushConfig({
    port,
    encoding,
    gcmKey,
  });

  // If we are supporting `gcm_sender_id`, we can set this option:
  if (gcmAPIKey) webPush.setGCMAPIKey(gcmAPIKey);
  // otherwise, if we are supporting modern push services, we would
  // send this key per push notification for those that require it.

  // Just as with our config, we ideally want to keep track of our subscribers and persist them beyond runtime memory:
  const subscriptions = new Map();

  async function sendNotification(subscription, notification) {
    if (subscription) {
      const { title, ...options } = notification;

      // Timestamps can be used client-side to order multiple notifications:
      if (options.timestamp === undefined) {
        options.timestamp = Date.now();
      }

      // We stringify our payload before sending:
      const payload = JSON.stringify({
        title,
        options,
      });

      // This is a unique endpoint per subscription, it is generated when a user subscribes:
      const parsedUrl = url.parse(subscription.endpoint);
      // The audience is used as part of a JWT token:
      const audience = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

      // Here we generate the needed headers for the request to the push service:
      const headers = webPush.getVapidHeaders(
        audience,
        mailto,
        keys.publicKey,
        keys.privateKey,
        contentEncoding,
      );

      const sendNotificationOptions = {
        gcmAPIKey,
        vapidDetails,
        headers,
        contentEncoding,
        proxy,
      };

      if (verbose) {
        // To get a better idea of what is sent to the push service,
        // we can log the details as well as use this to compose our request:
        const details = await webPush.generateRequestDetails(
          subscription,
          payload,
          sendNotificationOptions,
        );
        console.log('\nrequest details', details);
      }

      // Finally, we can send the push notification using:
      return webPush.sendNotification(
        subscription,
        payload,
        sendNotificationOptions,
      );
    }

    return null;
  }

  return {
    keys,
    mailto,
    contentEncoding,
    gcmAPIKey,
    vapidDetails,
    subscriptions,
    sendNotification,
  };
}

```

Implementing a REST service to handle push could look like:

`/server.js`
```js
import express from 'express';
import bodyParser from 'body-parser';

import { createWebPush } from './server/push';

const port = process.env.PORT || 5000;
const proxy = '';
const verbose = true;

const push = createWebPush({
  port,
  proxy,
  verbose,
});

express()
  .get('/subscribe', (request, response) => {
    // 1. send the public applicationServerKey
    if (verbose)
      console.log(`\nsending application server key:`, push.keys.publicKey);
    response.status(200);
    response.set({
      'Content-Type': 'text/plain',
    });
    response.write(push.keys.publicKey);
  })
  .use(bodyParser.json())
  .post('/subscribe', (request, response) => {
    // 2. send over the subscription created in the browser back to the server
    const { body: { subscription } = {} } = request;
    if (!subscription) {
      response.status(400);
      response.write('missing subscription');
    } else {
      if (verbose) {
        console.log('\nsetting subscription');
      }
      push.subscriptions.set(subscription.endpoint, subscription);
      response.status(202);
    }
    response.end();
  })
  .delete('/subscribe', (request, response) => {
    // 3. in the event of re-subscription or unsubscribe, remove the old subscription from the server
    const { body: { subscription } = {} } = request;
    if (!subscription) {
      response.status(400);
      response.write('missing subscription');
    } else {
      if (verbose) console.log('\ndeleting subscription');
      push.subscriptions.delete(subscription.endpoint);
      response.status(202);
    }
    response.end();
  })
  .post('/dispatch', async function dispatch(request, response) {
    const {
      // To dispatch a notification, we will need both the subscription (for whom) and notification (and what):
      body: { subscription, notification },
    } = request;
    // 4. notify a user by dispatching a notification
    try {
      const results = await push.sendNotification(subscription, notification);
      response.status(202);
      if (verbose) console.log(`\npush service response`, results);
    } catch (error) {
      response.set({
        'Content-Type': 'text/plain',
      });
      if (verbose) console.log(`\npush service error:`, error);
      // In the event the push service tells us the subscription is "Not Found" or "Gone",
      // we remove it from our subscriptions.
      if ([404, 410].includes(error.statusCode)) {
        push.subscriptions.delete(subscription.endpoint);
        response.status(error.statusCode);
        response.write(error.body);
        // The maximum size of a push notification payload is 4096 bytes, if it exceeds:
      } else if (error.statusCode === 413) {
        response.status(error.statusCode);
        response.write('payload too big');
      } else {
        // otherwise, something has gone wrong.
        response.status(500);
        response.write(error.message);
      }
    }
    response.end();
  })
  .listen(port, function onListen(error) {
    if (error) console.error(error);
    else console.log(`\nserver is listening on %s`, port);
  });

```

[☝️ Return To Top](#-web-push)
