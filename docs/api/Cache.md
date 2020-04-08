[caches-api]: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
[caches-open]: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/open
[caches-keys]: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/keys

[cache-api]: https://developer.mozilla.org/en-US/docs/Web/API/Cache
[cache-match]: https://developer.mozilla.org/en-US/docs/Web/API/Cache/match
[cache-matchAll]: https://developer.mozilla.org/en-US/docs/Web/API/Cache/matchAll
[cache-add]: https://developer.mozilla.org/en-US/docs/Web/API/Cache/add
[cache-addAll]: https://developer.mozilla.org/en-US/docs/Web/API/Cache/addAll
[cache-put]: https://developer.mozilla.org/en-US/docs/Web/API/Cache/put
[cache-delete]: https://developer.mozilla.org/en-US/docs/Web/API/Cache/delete

# Cache

[👈 Go to `README`](../../README.md)

[👆 Back to `API`](./README.md)

## 📖 Table of Contents

- [`open`](#-open)
- [`keys`](#-keys)
- [`match`](#-match)
- [`matchAll`](#-matchAll)
- [`add`](#-add)
- [`addAll`](#-addAll)
- [`put`](#-put)
- [`remove`](#-remove)
- [`removeAll`](#-removeAll)
- [`entries`](#-entries)
- [`clear`](#-clear)
- [`normalizeRequest`](#-normalizeRequest)
- [**`Meta Data`**](#-MetaData)
  - [`createCacheName`](#-createCacheName)
  - [`createCacheEntryName`](#-createCacheEntryName)
  - [`createMetaRequest`](#-createMetaRequest)
  - [`createMetaResponse`](#-createMetaResponse)
  - [`getMetaStore`](#-getMetaStore)
  - [`getMetaData`](#-getMetaData)
  - [`setMetaData`](#-setMetaData)
  - [`deleteMetaData`](#-deleteMetaData)

### [`open`][caches-open]

Opens the cache by `cacheName`.

```js
import { open } from '@americanexpress/one-service-worker';

export async function getCache(cacheName) {
  const cache = await open(cacheName);

  // perform normal operations
  // cache.add( ... )
  // cache.match( ... )

  return cache;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `cacheName` | `[String]` | `false` | The cache name used to open a cache |

**Returns**

`Promise( Cache )`

&nbsp;

### [`keys`][caches-keys]

Returns the requests in a given cache; if no request is given, returns all requests in a given cache.

```js
import { keys } from '@americanexpress/one-service-worker';

export async function getCacheKeys() {
  const cacheRequests = await keys();
  return cacheRequests;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `request` | `String|Request` | `true` | String URL or Request |
| `options.cacheName` | `String` | `false`  | Cache name to search in |
| `options.ignoreSearch` | `Boolean` | `false` | Ignores any search in the URL (eg `/?key=value..`) |
| `options.ignoreMethod` | `Boolean` | `false` | Ignores the HTTP method |
| `options.ignoreVary` | `Boolean` | `false` | Ignores the `VARY` header |

**Returns**

`Promise( [Request] )`

&nbsp;

### [`match`][cache-match]

Matches a given request and returns a response if it exists.

```js
import { match } from '@americanexpress/one-service-worker';

export async function doesCacheItemExist(request) {
  const matchedResponse = await match(request);
  return !!matchedResponse;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `request` | `String|Request` | `true` | String URL or Request |
| `options.cacheName` | `String` | `false`  | Cache name to search in |
| `options.ignoreSearch` | `Boolean` | `false` | Ignores any search in the URL (eg `/?key=value..`) |
| `options.ignoreMethod` | `Boolean` | `false` | Ignores the HTTP method |
| `options.ignoreVary` | `Boolean` | `false` | Ignores the `VARY` header |

**Returns**

`Promise( Response )`

&nbsp;

### [`matchAll`][cache-matchAll]

Matches the given requests and returns responses.

```js
import { matchAll } from '@americanexpress/one-service-worker';

export async function getCacheResponsesIfExists(request) {
  const matchedResponses = await matchAll(request);
  return matchedResponses;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `request` | `String|Request|[String|Request]` | `true` | String URL or Request, can be array of either |
| `options.cacheName` | `String` | `false`  | Cache name to search in |
| `options.ignoreSearch` | `Boolean` | `false` | Ignores any search in the URL (eg `/?key=value..`) |
| `options.ignoreMethod` | `Boolean` | `false` | Ignores the HTTP method |
| `options.ignoreVary` | `Boolean` | `false` | Ignores the `VARY` header |

**Returns**

`Promise( [ [Response] ] )`

&nbsp;

### [`add`][cache-add]

Adds the request to the cache.

```js
import { add } from '@americanexpress/one-service-worker';

export async function addToMiscCache(request) {
  await add(request, { cacheName: 'misc' });
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `request` | `String|Request` | `true` | String URL or Request |
| `options.cacheName` | `String` | `false`  | Cache name to add in |

**Returns**

`Promise( void )`

&nbsp;

### [`addAll`][cache-addAll]

Adds all the requests given if they do not exist.

```js
import { addAll } from '@americanexpress/one-service-worker';
import { networkCacheStrategy } from '@americanexpress/one-service-worker/es/constants';

export async function addStylesToCache(requests) {
  await addAll(requests, {
    cacheName: 'styles',
  });
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `requests` | `[String|Request]` | `true` | String URL or Request in an array |
| `options.cacheName` | `String` | `false`  | Cache name to add all in |

**Returns**

`Promise( void )`

&nbsp;

### [`put`][cache-put]

Puts a request into the cache. Overwrites the request/response if it exists.

```js
import { put } from '@americanexpress/one-service-worker';

export async function putInJSCache(request, response) {
  await put(request, response, { cacheName: 'javascript' });
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `request`  | `String|Request` | `true` | String URL or Request |
| `response` | `Response` | `true` | Response to couple with a given request |
| `options.cacheName` | `String` | `false`  | Cache name to put in |

**Returns**

`Promise( void )`

&nbsp;

### [`remove`][cache-delete]

Deletes a given request from cache.

```js
import { remove } from '@americanexpress/one-service-worker';

export async function removeCacheItem(request) {
  const removedResult = await remove(request);
  return removedResult === true;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `request`  | `String|Request` | `true` | String URL or Request |
| `options.cacheName` | `String` | `false`  | Cache name to put in |
| `options.ignoreSearch` | `Boolean` | `false` | Ignores any search in the URL (eg `/?key=value..`) |
| `options.ignoreMethod` | `Boolean` | `false` | Ignores the HTTP method |
| `options.ignoreVary` | `Boolean` | `false` | Ignores the `VARY` header |

**Returns**

`Promise( Boolean )`

&nbsp;

### `removeAll`

Deletes all given requests from the cache.

```js
import { removeAll } from '@americanexpress/one-service-worker';

export async function unloadCacheItems(items = [], cacheName) {
  const removedResult = await removeAll(items, { cacheName });
  return removedResult;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `requests` | `[String|Request]` | `true` | String URL or Request in an array |
| `options.cacheName` | `String` | `false` | Cache name to put in |
| `options.ignoreSearch` | `Boolean` | `false` | Ignores any search in the URL (eg `/?key=value..`) |
| `options.ignoreMethod` | `Boolean` | `false` | Ignores the HTTP method |
| `options.ignoreVary` | `Boolean` | `false` | Ignores the `VARY` header |

**Returns**

`Promise( [Boolean] )`

&nbsp;

### `entries`

Maps out the cache name(s) given into entries with their request keys.

```js
import { entries } from '@americanexpress/one-service-worker';

export async function createCacheMap(cacheNames) {
  const cacheEntries = await entries(cacheNames);
  return new Map(cacheEntries);
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `cacheNames` | `String|[String]` | `false` | The cache name used to open a cache |

**Returns**

`Promise( [[[Request], Cache, String]] )`

&nbsp;

### `clear`

Deletes request from the cache or the cache itself, based on the fn callbacks.

```js
import { clear } from '@americanexpress/one-service-worker';

export async function unloadCacheImages(items = [], cacheName) {
  await clear(
    request => request.url.endsWith('png'),
    name => name === cacheName,
  );
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `invalidateRequest` | `Function` | `false` | Function that is called with Requests for returning a Boolean |
| `invalidateCache` | `Function` | `false` | Function that is called with cacheName for returning a Boolean |

**Returns**

`Promise( [void] )`

&nbsp;

### `normalizeRequest`

Takes in a `String` URL or `Request` parameter and returns a `Request`. Used to normalize the cache requests.

```js
import { normalizeRequest } from '@americanexpress/one-service-worker';

export function requestKey() {
  const req = normalizeRequest('/url/to/normalize');
  return req.url;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `request` | `String|Request` | `true` | Function that is called with a Request or String and returns a request |

**Returns**

`Request`

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)

&nbsp;

## MetaData

Meta data is an internal store that adds more information on the requests and responses in your cache.
It is used by middleware such as `expiration` to set a key that is attributed to a request, and uses
the meta data on a given request to perform functions.

### `createCacheName`

Creates the default `meta-data` `cacheName` and returns it.

```js
import { createCacheName } from '@americanexpress/one-service-worker';

export function requestKey() {
  const req = createCacheName();
  return req.url;
}
```

**Returns**

`String`

&nbsp;

### `createCacheEntryName`

Creates the `meta-data` entry name for a request. Used to group all the `meta-data`
for a given `cacheName` to house the individual records per key (eg `Request` url).

```js
import { createCacheEntryName } from '@americanexpress/one-service-worker';

export function requestKey() {
  const name = createCacheEntryName('my-custom-meta-cache');
  return name;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `cacheName` | `String` | `false` | The name of the cache entry used to group `meta-data` |

**Returns**

`String`

&nbsp;

### `createMetaRequest`

Creates the `meta-data` `Request` key for a given `cacheName`.

```js
import { createMetaRequest } from '@americanexpress/one-service-worker';

export function requestKey() {
  const req = createMetaRequest('my-custom-meta-cache');
  return req.url;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `cacheName` | `String` | `false` | The name of the cache attributed to the meta data |

**Returns**

`Request`

&nbsp;

### `createMetaResponse`

Creates the `meta-data` `Response` to use for storing associated data.

```js
import { createMetaResponse } from '@americanexpress/one-service-worker';

export async function createMyMetaResponse(key, data) {
  const response = createMetaResponse({ url: key, data });
  return response;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options.url` | `String` | `false` | String URL to grab a single meta data record |
| `options.data` | `Any` | `false` | Any serializable data to store |

**Returns**

`Response`

&nbsp;

### `getMetaStore`

Gets the response that stores the meta data for a given `cacheName`.

```js
import { getMetaStore } from '@americanexpress/one-service-worker';

export async function getMetaDataResponse() {
  const response = await getMetaStore('my-custom-meta-cache');
  return response;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `cacheName` | `String` | `false` | The name of the cache attributed to the meta data |

**Returns**

`Response`

&nbsp;

### `getMetaData`

Gets the `meta-data` for a given cache. If a URL is supplied, the specific meta data for the
URL will be returned.

```js
import { getMetaData } from '@americanexpress/one-service-worker';

export async function getMetaForKey(key) {
  const data = await getMetaData({
    cacheName: 'my-custom-meta-cache',
    url: key,
  });
  return data;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options.url` | `String` | `false` | String URL to grab a single meta data record |
| `options.cacheName` | `String` | `false` | The name of the cache attributed to the meta data |

**Returns**

`Promise( Object )`

&nbsp;

### `setMetaData`

Sets the `meta-data` for a given cache. If a URL is supplied, the specific meta data for the
URL will be set and returned.

```js
import { setMetaData } from '@americanexpress/one-service-worker';

export async function setMetaForKey(key, metadata) {
  const data = await setMetaData({
    cacheName: 'my-custom-meta-cache',
    url: key,
    metadata,
  });
  return req.url;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options.url` | `String` | `false` | String URL to set a single meta data record |
| `options.cacheName` | `String` | `false` | The name of the cache attributed to the meta data |
| `options.metadata` | `Any` | `false` | The meta data to set |

**Returns**

`Promise( Object )`

&nbsp;

### `deleteMetaData`

Removes the `meta-data` for the given cacheName, or of an individual record if a URL is provided.

```js
import { deleteMetaData } from '@americanexpress/one-service-worker';

export async function deleteMetaForKey(key) {
  const data = await deleteMetaData({
    cacheName: 'my-custom-meta-cache',
    url: key,
  });
  return req.url;
}
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options.url` | `String` | `false` | String URL to delete a single meta data record |
| `options.cacheName` | `String` | `false` | The name of the cache attributed to the meta data |

**Returns**

`Promise( Object )`

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)