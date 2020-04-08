[contributing-agreement]: https://cla-assistant.io/americanexpress/one-service-worker
[spec]: https://www.w3.org/TR/service-workers

[license-doc]: ./LICENSE.txt
[contrib-doc]: ./CONTRIBUTING.md
[code-of-conduct-doc]: ./CODE_OF_CONDUCT.md

[api-doc]: ./docs/api/README.md
[recipes-doc]: ./docs/recipes/README.md
[best-practices-doc]: ./docs/recipes/BestPractices.md

<h1 align="center">
  <img src="./one-service-worker.png" alt="one-service-worker - One Amex" width="50%" />
</h1>

[![npm](https://img.shields.io/npm/v/@americanexpress/one-service-worker)](https://www.npmjs.com/package/@americanexpress/one-service-worker)
![npm bundle size](https://img.shields.io/bundlephobia/min/@americanexpress/one-service-worker?label=minified&style=flat-square)
![CI](https://github.com/americanexpress/one-service-worker/workflows/CI/badge.svg)

One Service Worker is a minimal, light-weight, `Promise` based library that
unifies the service worker and browser threads under one API; designed with
the [Service Worker living specification][spec] and with developers in mind.

## 👩‍💻 Hiring 👨‍💻

Want to get paid for your contributions to `@americanexpress/one-service-worker`?
> Send your resume to oneamex.careers@aexp.com

## 📖 Table of Contents

* [Features](#-features)
* [Documentation](#-documentation)
  * [Guides](#-guides)
  * [API](#-api)
* [Usage](#-usage)
  * [Installation](#-&#x1F680;-installation)
  * [Importing](#-&#x1F69B;-importing)
  * [Unpacking](#-&#x1F4E6;-unpacking)
* [Quick Start](#-&#x1F3C3;-&#x2640;-quick-start-&#x1F3C3;-&#x2642;)
* [Contributing](#-contributing)

## ✨ Features

* API as a functional toolbox to use in your JavaScript and Service Worker
* core library was made with the [Service Worker spec][spec]
* runtime extension to check environments and guard against errors
* catalog of pre-fabricated middleware for writing flat, composable service worker scripts
* caching extensions and cache management middleware for designing your cache
* event extension to listen and respond to events
* no dependencies

## 📚 Documentation

### **Recipes**

We have an assortment of recipes and guides to help out with use cases
and usage patterns we recommend with the library:

[**👉 Check out the various recipes and guides 👈**][recipes-doc]

### **API**

If you're interested in learning more about the API or want to contribute,
here is an overview of what the library API is comprised of:

[**👉 Check out the complete API catalogue 👈**][api-doc]

## Usage

### 🚀 **Installation**

```bash
$ npm install @americanexpress/one-service-worker --save

# or

$ yarn add @americanexpress/one-service-worker
```

### 🚛 **Importing**

`one-service-worker` can be imported from multiple formats
to match your building setup, all from the same entry-point.

`esm`
```js
import {
  register,
  isServiceWorkerSupported,
} from '@americanexpress/one-service-worker';
```

`cjs`
```js
const {
  register,
  isServiceWorkerSupported,
} = require('@americanexpress/one-service-worker');
```

### 📦 **Unpacking**

#### **Universal module definitions**

`one-service-worker` comes with pre-built library bundles that are ready
for the browser to use.
With `umd` format scripts, the library will be added to the global scope
as `oneServiceWorker` when included in a given execution context.

`umd`
```js
const { register, isServiceWorkerSupported } = (
  self || window
).oneServiceWorker;
```

#### `index.html`

```html
<html>
  <body>
    <script src="@americanexpress/one-service-worker/index.min.js"></script>
    <script>
      const { register, postMessage } = window.oneServiceWorker;
      await register('/sw.js', { scope: '/' });
      await postMessage({ id: 'ping' });
    </script>
  </body>
</html>
```

> There is a gzipped file `@americanexpress.../index.min.js.gz` for convenience;
> both the minified and gzipped builds are sourced from the `index.umd.js` build output.

#### `sw.js`

```js
importScripts('@americanexpress/one-service-worker/index.min.js');

const { on, messageContext, messenger } = self.oneServiceWorker;

on('message', [
  messageContext(),
  messenger({
    ping: event => {
      /* perform asynchronous actions on message with id 'ping' */
      event.waitUntil(Promise.resolve());
    },
  }),
]);
```

> `importScripts` is a browser ( WebWorker ) construct and not understood by bundlers or `node.js`.
> Without extra tooling, treat this path as if it is a relative path (or absolute url) to
> your web/static server.

#### **ES modules**

With `esm`, we can source `one-service-worker` library modules individually
to get the most out of tree-shaking (when bundling).
It can help out with scoping a service worker into feature sets.

#### `sw.js`

```js
importScripts('/sw.caching.js');
```

#### `sw.caching.js`

(via `@americanexpress/one-service-worker/es/`)

```js
import { configure } from '@americanexpress/one-service-worker/es/runtime.js';
import { addAll } from '@americanexpress/one-service-worker/es/cache.js';
import { on } from '@americanexpress/one-service-worker/es/events.js';

configure({
  events: true,
});

on('activate', event => {
  event.waitUntil(addAll(['app.js', 'vendor.js', 'styles.css']));
});
```

> the ES import/export syntax will not work in the service worker as it is,
> as it requires bundling by a tool like `rollup` or `webpack`.

#### `index.html`

(or via `@americanexpress/one-service-worker/index.es.js`)

```html
<html>
  <body>
    <script type="module">
      import {
        register,
      } from '@americanexpress/one-service-worker/index.es.js';
       await register('/sw.js', { scope: '/' });
    </script>
  </body>
</html>
```

## 🏃‍♀️ Quick Start 🏃‍♂

> Prerequisite: the service worker requires a secure origin using `https`.
> For local development, we can use `localhost` with most browser vendors.

Before starting, please take the time to review our guide on
[**`Best Practices`**][best-practices-doc].

#### `sw.js` - Service Worker Thread

```js
import {
  configure,
  skipWaiting,
  clientsClaim,
  appShell,
  manifest,
  precache,
  cacheRouter,
  escapeHatchRoute,
  navigationPreloadActivation,
  navigationPreloadResponse,
} from '@americanexpress/one-service-worker';

// to configure the library runtime, you can enable and disable features
configure({
  navigationPreload: true,
});

// ready-made middleware can help you
// apply common patterns quickly
on('install', skipWaiting());

// with `on`, we can bind to events as we normally would
// with self.addEventListener(...), with the addition of
// accepting an array of event handlers, creating a
// middleware stack that share a context (more on that later)
on('activate', [
  // whenever a service worker is activated,
  // claiming the active clients is done to control
  // the open windows/tabs without needing to reload
  clientsClaim(),
  // middleware can react to configuration
  // and act based on settings, during the
  // appropriate lifecycle
  navigationPreloadActivation(),
  // during activation (runs on installs and updates),
  // we can ensure our precache store is ready for quick
  // cache matching and offline fallback
  precache(['client.js']),
]);

// we stack the middleware in the order
// we want them performed
on('fetch', [
  // if we ever need to bail out of using the service worker
  // a fetch request or browser navigation to the given route
  // and the service worker will be unregistered
  escapeHatchRoute({ route: '/__sw/__escapeHatch' }),
  // in the event of `event.preloadResponse`,
  // we use it to respond and fallback to fetch
  navigationPreloadResponse(),
  // to support offline navigation, having an app shell gives
  // us a fallback on navigation requests, while refreshing
  // when online and when the shell route is matched
  appShell({ route: '/index.html' }),
  // middleware can be used to create a response
  // without needing to go to the server and directly
  // from the service worker
  manifest(
    {
      name: 'my-app',
      short_name: 'app',
      start_url: '/index.html',
      icons: [],
    },
    '/manifest.webmanifest',
  ),
  // router matching middleware for selecting
  // which fetch traffic to cache and which to
  // respond to from the cache
  cacheRouter({
    cacheName: 'js-cache',
    match: ({ request }) => request.url.endsWith('.js'),
  }),
  // more advanced middleware will use event context
  // to communicate between middleware. The cacheRouter
  // adds { request, cacheName } to context on match for the
  // expiration middleware to tag and manage for 7 days
  expiration({ maxAge: 7 * 24 * 60 * 60 * 1000 }),
]);
```

#### `client.js` - Main Thread

```js
import {
  once,
  register,
  isServiceWorkerSupported,
} from '@americanexpress/one-service-worker';

// guard against unsupported features
if (isServiceWorkerSupported()) {
  // first thing we need to do is
  // install the service worker
  register('/sw.js', {
    scope: '/',
    updateViaCache: 'none',
  })
    .catch(console.error)
    .then(console.log);

  once('registration', function onRegistration(registration) {
    fetch('/manifest.webmanifest')
      .then(response => response.json())
      .then(console.log);
  });
} else {
  // do nothing and inform dependents on lack of support
}
```

## 🏆 Contributing

We welcome Your interest in the American Express Open Source Community on Github.
Any Contributor to any Open Source Project managed by the American Express Open
Source Community must accept and sign an Agreement indicating agreement to the
terms below. Except for the rights granted in this Agreement to American Express
and to recipients of software distributed by American Express, You reserve all
right, title, and interest, if any, in and to Your Contributions. Please
[fill out the Agreement][contributing-agreement].

Please feel free to open pull requests and see
[CONTRIBUTING.md][contrib-doc] to learn how to get started contributing.

## 🗝️ License

Any contributions made under this project will be governed by the
[Apache License 2.0][license-doc].

## 🗣️ Code of Conduct

This project adheres to the
[American Express Community Guidelines][code-of-conduct-doc].
By participating, you are expected to honor these guidelines.
