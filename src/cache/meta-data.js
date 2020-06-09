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

import { match, put, remove, createCacheName, defaultCacheName } from './cache';

export const metaDataCacheName = '__meta';

export function createMetaCacheName() {
  return createCacheName(metaDataCacheName);
}

export function createMetaCacheEntryName(cacheName = defaultCacheName) {
  return `/${createMetaCacheName()}/${cacheName}`;
}

export function createCacheEntryName(cacheName) {
  console.warn(
    '[One Service Worker]: Deprecation Notice - %s is marked for deprecation and will not be accessible in the next major release.',
    'createCacheEntryName',
  );
  return createMetaCacheEntryName(cacheName);
}

export function createMetaRequest(cacheName) {
  return new Request(createMetaCacheEntryName(cacheName));
}

export function createMetaResponse({ url, data = {} } = {}) {
  const headers = new Headers({});
  headers.append('content-type', 'application/json');
  return new Response(JSON.stringify(data), {
    url,
    headers,
    status: 200,
  });
}

export function getMetaStore(cacheName) {
  return match(createMetaRequest(cacheName), {
    cacheName: createMetaCacheName(),
  }).then(exists => (exists ? exists.json() : Promise.resolve({})));
}

export function getMetaData({ url, cacheName } = {}) {
  return getMetaStore(cacheName).then(data => {
    if (url) {
      const request = new Request(url);
      return data[request.url] || {};
    }
    return data;
  });
}

export function setMetaData({ url, cacheName, metadata } = {}) {
  return getMetaStore(cacheName).then(data => {
    const metaRequest = createMetaRequest(cacheName);
    let updates = null;

    let key = null;
    if (url) {
      ({ url: key } = new Request(url));

      updates = {
        ...data,
        [key]: metadata,
      };
    } else if (metadata) updates = metadata;
    else return Promise.resolve(key);

    return put(
      metaRequest.clone(),
      createMetaResponse({
        url: metaRequest.url,
        data: updates,
      }),
      {
        cacheName: createMetaCacheName(),
      },
    ).then(() => (key ? updates[key] : updates));
  });
}

export function deleteMetaData({ url, cacheName } = {}) {
  return getMetaStore(cacheName).then(data => {
    const updates = { ...data };
    const metaRequest = createMetaRequest(cacheName);

    let deleted = false;

    if (url) {
      const request = new Request(url);
      delete updates[request.url];
      deleted = true;

      if (Object.keys(updates).length === 0) {
        return remove(metaRequest, {
          cacheName: createMetaCacheName(cacheName),
        });
      }

      return setMetaData({
        metadata: updates,
        cacheName,
      }).then(() => deleted);
    }

    if (cacheName) {
      return remove(metaRequest, {
        cacheName: createMetaCacheName(cacheName),
      });
    }

    return deleted;
  });
}
