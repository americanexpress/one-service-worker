/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { getCacheOptions } from '../utility/validation';

export const cachePrefix = '__sw';
export const defaultCacheName = 'one-cache';
export const defaultCacheOptions = {
  cacheName: defaultCacheName,
};

export function normalizeRequest(request) {
  if (!request) return undefined;
  return request instanceof Request ? request : new Request(request);
}

export function open(cacheName = defaultCacheName) {
  return caches.open(cacheName);
}

export function has(cacheName = defaultCacheName) {
  return caches.has(cacheName);
}

export function keys(request, options = defaultCacheOptions) {
  const cacheOptions = getCacheOptions(options);
  return open(cacheOptions.cacheName).then(cache => {
    return cache.keys(normalizeRequest(request), cacheOptions);
  });
}

export function match(request, options) {
  if (!options) return caches.match(normalizeRequest(request));
  const cacheOptions = getCacheOptions(options);
  return open(cacheOptions.cacheName).then(cache => {
    return cache.match(normalizeRequest(request), cacheOptions);
  });
}

export function matchAll(request, options = defaultCacheOptions) {
  const cacheOptions = getCacheOptions(options);
  if (Array.isArray(request))
    return Promise.all(request.map(requesting => match(requesting, cacheOptions)));
  return open(cacheOptions.cacheName).then(cache => {
    return cache.matchAll(normalizeRequest(request), cacheOptions);
  });
}

export function add(request, options = defaultCacheOptions) {
  const cacheOptions = getCacheOptions(options);
  return open(cacheOptions.cacheName).then(cache => {
    return cache.add(normalizeRequest(request));
  });
}

export function addAll(requests = [], options = defaultCacheOptions) {
  const cacheOptions = getCacheOptions(options);
  return open(cacheOptions.cacheName).then(cache => {
    return cache.addAll(requests.map(normalizeRequest));
  });
}

export function put(request, response, options = defaultCacheOptions) {
  const cacheOptions = getCacheOptions(options);
  return open(cacheOptions.cacheName).then(cache => {
    return cache.put(normalizeRequest(request), response);
  });
}

export function remove(request, options = defaultCacheOptions) {
  const cacheOptions = getCacheOptions(options);
  return open(options.cacheName).then(cache => {
    return cache.delete(normalizeRequest(request), cacheOptions);
  });
}

export function removeAll(requests = [], options = defaultCacheOptions) {
  const cacheOptions = getCacheOptions(options);
  return open(cacheOptions.cacheName).then(cache => {
    return Promise.all(
      requests.map(request => cache.delete(normalizeRequest(request), cacheOptions)),
    );
  });
}

export function entries(cacheName) {
  return (cacheName ? Promise.resolve([].concat(cacheName)) : caches.keys()).then(cacheNames => {
    return Promise.all(
      cacheNames.map(key =>
        open(key).then(cache => cache.keys().then(cacheKeys => [cacheKeys, cache, key])),
      ),
    );
  });
}

export function clear(invalidateRequest = () => true, invalidateCache = () => true) {
  return entries().then(cacheEntries => {
    const promises = [];
    cacheEntries.forEach(([cacheRequests, cache, cacheName]) => {
      if (invalidateCache(cacheName)) {
        promises.push(caches.delete(cacheName));
      } else {
        cacheRequests.forEach(request => {
          if (invalidateRequest(request, cacheName)) promises.push(cache.delete(request));
        });
      }
    });
    return Promise.all(promises);
  });
}
