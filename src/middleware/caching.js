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

import { match, addAll, put, clear, createCacheName } from '../cache';
import { isServiceWorker, isCacheStorageSupported } from '../utility/runtime';

import { noop } from './utility';

export const routerCacheName = createCacheName('router');
export const getCacheName = cacheName => (cacheName ? createCacheName(cacheName) : routerCacheName);
export const isCacheWorkerSupported = () => isCacheStorageSupported() && isServiceWorker();
export const fetchAndCache = ({ request, cacheName, waitUntil, fetchOptions }) =>
  fetch(request.clone(), fetchOptions).then(response => {
    waitUntil(
      put(request.clone(), response.clone(), {
        cacheName,
      }),
    );
    return response;
  });

export function createCacheRouter({ cacheName, match: matcher, fetchOptions } = {}) {
  if (!isCacheWorkerSupported()) return noop;

  let test = () => false;
  if (typeof matcher === 'function') test = matcher;
  else if (matcher instanceof RegExp) test = ({ request: { url } }) => matcher.test(url);

  const name = getCacheName(cacheName);
  // eslint-disable-next-line consistent-return
  return function cacheRouter(event, context) {
    if (test(event)) {
      context.set('cacheName', name);
      context.set('request', event.request.clone());

      event.respondWith(
        match(event.request.clone()).then(
          cachedResponse =>
            cachedResponse ||
            fetchAndCache({
              waitUntil: promise => event.waitUntil(promise),
              request: event.request,
              cacheName: name,
              fetchOptions,
            }),
        ),
      );

      return true;
    }
  };
}

export function createCacheStrategy() {
  if (!isCacheWorkerSupported()) return noop;

  return function cacheStrategy(event) {
    event.waitUntil(
      match(event.request.clone()).then(
        cachedResponse => cachedResponse && event.respondWith(cachedResponse),
      ),
    );
    return true;
  };
}

export function createCacheBusting(requestInvalidator, cacheInvalidator) {
  if (!isCacheWorkerSupported()) return noop;

  return function cacheBusting(event) {
    event.waitUntil(clear(requestInvalidator, cacheInvalidator));
  };
}

export function createPrecache(requests = [], { cacheName } = {}) {
  if (!isCacheWorkerSupported() || requests.length === 0) return noop;

  return function precacheMiddleware(event) {
    event.waitUntil(
      addAll(requests, {
        cacheName: createCacheName(cacheName),
      }),
    );
  };
}
