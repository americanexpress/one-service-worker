# Patterns
<!--ONE-DOCS-HIDE start-->
[👈 Go to `README`](../../README.md)

[👆 Back to `Guides`](./README.md)
<!--ONE-DOCS-HIDE end-->

## Scope based service worker scripts

For some applications, having a mix of general and specialized service workers
could be desired for organizing our origin.
Depending on scope (`self.registration.scope`), we can configure our worker and
utilize `importScripts` to load sets of functionality based on a given scope.

**`/sw.js`**

```js
try {
  switch (self.registration.scope.replace(location.origin, '')) {
    case '/':
      importScripts('/sw/lifecycle.js');
      importScripts('/sw/push.js');
      break;
    case '/statics':
      importScripts('/sw/lifecycle.js');
      importScripts('/sw/sync.js');
      importScripts('/sw/caching.js');
      break;
    case '/data':
      importScripts('/sw/lifecycle.js');
      importScripts('/sw/sync.js');
      importScripts('/sw/data.js');
      break;
    case '/payments':
      importScripts('/sw/lifecycle.js');
      importScripts('/sw/payment.js');
      break;
    default:
      // any rogue or accidental installations should be immediately removed
      self.unregister();
      break;
  }
} catch (error) {
  // in the event of failure, unregister
  self.unregister();
}
```

When we set one entry point for all service workers operating under one origin,
our definition of functionality per scope gives us a high overview of what each
scope is responsible for and its dependencies. In addition, our service worker
scripts become modular and composable.

It's important however to ensure that between scripts, there are no conflicts with
events. As a measure to prevent this, it's important to focus on not repeating
events used in the other scripts.

If the need to remove the service workers registered on multiple scopes,
we can use the `escapeHatch` function to remove them all, or use `unregister`
with the desired `scope` for selective removal.

**`/client.js`**

```js
import {
  register,
  unregister,
  escapeHatch,
} from '@americanexpress/one-service-worker';

export async function unregisterWorkers(scope) {
  if (typeof scope === 'string' && scope) await unregister(scope);
  else await escapeHatch();
}

export async function registerWorkers() {
  const updateViaCache = 'none';

  await register('/sw.js', { scope: '/', updateViaCache });
  await register('/sw.js', { scope: '/data', updateViaCache });
  // ... others
}
```

The `updateViaCache` is important in the given scenario. By setting the value to `none`,
we are ensuring our imported scripts in the worker are not sourced from the cache.

An advantage of scope based service workers is having the client-side decide when
to register a service worker at a given scope, based on the needs of the client
side component.

[☝️ Return To Top](#-patterns)
