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

import { getMetaData, setMetaData, deleteMetaData, remove } from '../cache';
import { isCacheStorageSupported, isServiceWorker } from '../utility/runtime';

export const ONE_DAY_IN_SECONDS = 24 * 60 * 60 * 1000;
export const ONE_WEEK_IN_SECONDS = 7 * ONE_DAY_IN_SECONDS;
export const ONE_MONTH_IN_SECONDS = 4 * 7 * ONE_DAY_IN_SECONDS;
export const EXPIRATION_KEY = 'expires';

export default function createExpirationMiddleware({ maxAge = ONE_MONTH_IN_SECONDS } = {}) {
  if (!isCacheStorageSupported() || !isServiceWorker()) return function noop() {};

  return function expirationMiddleware(event, context) {
    const { request } = context.get();

    if (request && request instanceof Request) {
      const { url } = event.request;
      const now = Date.now();
      const expired = now - maxAge;

      event.waitUntil(
        getMetaData({
          url,
        }).then(meta => {
          const expiring = meta[EXPIRATION_KEY] || 0;

          if (EXPIRATION_KEY in meta && expiring < expired) {
            return deleteMetaData({ url }).then(() => remove(request.clone()));
          }

          return setMetaData({
            url,
            metadata: {
              ...meta,
              [EXPIRATION_KEY]: now + maxAge,
            },
          });
        }),
      );
    }
  };
}
