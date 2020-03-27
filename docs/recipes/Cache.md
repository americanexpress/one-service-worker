[cache-storage-api]: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
[cache-api]: https://developer.mozilla.org/en-US/docs/Web/API/Cache

# Caching

[👈 Go to `README`](../../README.md)

[👆 Back to `Recipes`](./README.md)

With the [`caches` CacheStorage][cache-storage-api] and [`cache` Cache][cache-api], we can create and manage
a service worker first caching solution.

The first thing we need is to put a `fetch` handler in our service worker:

```js
self.addEventListener('fetch', event => {
  // first, we make the decision to respond with:
  event.respondWith(
    // next, we check for any matches in cache:
    caches.match(event.request.clone()).then(match => {
      if (match) return match;
      // if nothing matches the cache, fetch the request:
      return fetch(event.request.clone()).then(response => {
        // in case of anything other than GET:
        if (event.request.method === 'GET') {
          // we do not wait for the new response to be added to the cache to send it back to the main thread.

          // to allow us to keep the service worker from terminating,
          // we call event.waitUntil and pass in our promise to
          // guarantee service worker lifetime will last for this promise
          event.waitUntil(
            // we open our cache to operate on it:
            caches.open('my-cache').then(cache =>
              // add it to the cache:
              cache.put(event.request.clone(), response.clone()),
            ),
          );
        }
        // the response is sent right after:
        return response;
      });
    }),
  );
});
```

> in production, you do not want to do this. This example serves to familiarize yourself with the api.

This example will cache anything with a `GET` request (using `cache.put`) and use the `caches.match` to grab
it. Two other takeaways:
- notice the `event.waitUntil` and `event.respondWith` (only in `fetch` event) are used. `waitUntil` is useful
for extending the service worker lifetime from terminating until a passed in promise is finished. `respondWith`
is when you are sure you want to handle the `fetch` response.
- `caches` is globally available on `window` and `self` of both threads. `caches.open('name')` is how we access the
`cache` and operate on it.

## more ideas for using the cache

### deleting caches
```js
(async function deleteCache() {
  await caches.delete('my-cache');
})();

(async function deleteCacheItem() {
  const cache = await caches.open('my-cache');
  await cache.delete(new Request('/offline.html'));
})();
```

### getting cache keys
```js
(async function getCacheKeys() {
  const cachesOpened = await caches.keys();
  console.log(cachesOpened);
})();

(async function getCacheItems() {
  const cache = await caches.open('my-cache');
  const requests = await cache.keys();
  console.log(requests);
})();
```

### pre caching
```js
(async function precache() {
  const cache = await caches.open('my-cache');
  await cache.add('/index.html');
  const response = await cache.match(new Request('/index.html'));
  console.log(response);
})();
```

[☝️ Return To Top](#-caching)