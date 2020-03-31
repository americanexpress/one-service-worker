[clear-site-data-header]: https://w3c.github.io/webappsec-clear-site-data/#example-killswitch

# Best Practices

[👈 Go to `README`](../../README.md)

[👆 Back to `Recipes`](./README.md)

## 📖 Table of Contents

- [Guidelines](#-guidelines)
- [Types of Failures](#-types-of-failures)

## Guidelines

**General**

- Do not change the service worker url (eg `/sw.js`) in any way; avoid renaming, hashing
or appending any variations to the script resource URL; The service worker was designed
to update and reinstall on a single byte difference and has built in invalidation
- install the service worker at the right time and wait for the `load` event on
the `html` document
- use `ServiceWorkerAllowed` header when serving `/sw.js` to define the scope at
which it can be installed

**Runtime**

- add feature flags to enable/disable the service worker and utilize a `kill switch`
in case of emergency
- adopt progressive enhancements and guard against unsupported browser APIs across
browser vendors and versions
- treat service worker configuration/state as immutable; lifecycle/functional events
do not affect the subsequent invocation and the change will not be recorded
If you need, use persistent stores to pull configuration or settings between
service worker termination and threads if need be

**Caching**

- the browser will always reload the service worker after 24hrs regardless of caching headers
- Pre-caching during lifecycle events in the service worker should be considered
hard dependencies
- do not store bad http status codes in the cache; it can cause unpredictable failures
- invalidation is an important consideration that needs to be proactively applied
- do not cache sensitive or user data and avoid any session related caching unless it
is integral to your application and cleared after the session ends
- do not cache navigation routes and serve the `html` document as the default, rather
allow the service worker to fetch the latest and fallback to the cached item during
offline

## Types of Failures

The service worker is a powerful tool for a web developer, yet it can be the
root of many failures if improperly applied. The best strategy to carry forward
when using the service worker is preventative in nature. We'll discuss a few
scenarios and discuss how we can avoid and remedy these pitfalls.

### Zombie Worker

When the service worker fails and we are unable to access a web app, common
actions we take as an end user like closing our browser, restarting our device
or for more advanced users, emptying our cache, the problem seems to persist.

To safe guard our origin from service worker failure, we can employ many of the
methods listed below simultaneously as measures to recover from failure.

#### Prevention

The most effective method to counter a zombie service worker is preventing errors
and catching them before the service worker script becomes incapable of repair.
Using a `try`/`catch` statement in critical parts of the service worker such as
lifecycle events (`install` & `activate`) can allow the worker to respond to some
degree of intervention.

#### No-op Rollback

It's important to have a no-op service worker ready to update clients that may have
suffered critical failure and need to be reset. For a no-op worker, our goal is to
only provide lifecycle events and nothing more; additionally, we should not load any
other scripts or execute anything else in the runtime to ensure we do not have another
faulty service worker propagate. An example:

```js
// required
self.addEventListener('install', () => {
  // we need to progress to the activate lifecycle for this worker to take effect
  self.skipWaiting();
});

// optional
self.addEventListener('activate', event => {
  // if we have open windows/tabs, we can list out open clients and have them navigate
  // to the current url - effectively reloading the pages with the new service worker
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(windowClients => {
      windowClients.forEach(windowClient => {
        windowClient.navigate(windowClient.url);
      });
    }),
  );
});
```

#### [`Clear-Site-Data` header][clear-site-data-header]

Although the `Clear-Site-Data` has many uses other than removing cache items and cookies,
it can be used to unregister a service worker and should be a viable option in modern
browsers.

#### The Escape Hatch (kill-switch)

In the event of any failure, we must ensure that we can remove the service worker
at all costs. For this reason, we have a middleware `escapeHatchRoute` that can
trigger un-registering the service worker from a navigation route.

#### Web Push for Mass Recall

When utilizing web push, we can extend the behavior to accept actions like
navigating to the escape hatch route or uninstalling the service worker inside
the event. For UX considerations and API limitations, transparently telling the
user that the application needs a critical update would communicate the push
behavior.

#### Service Worker Management Document

It might be beneficial to create an `html` document that would be cached on
lifecycle events for users to manually intervene and manage the cache on their
browser as well as remove the service worker altogether.

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)