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

import { match, normalizeRequest, put } from '../cache';
import { isServiceWorker, isOffline } from '../utility/runtime';

import { isNavigateRequest, isResponseSuccessful, noop } from './utility';

export default function createAppShell({ route = '/index.html', cacheName = 'offline' } = {}) {
  if (isServiceWorker()) {
    const request = normalizeRequest(route);

    return function appShell(event) {
      if (isOffline()) {
        if (isNavigateRequest(event.request)) {
          event.respondWith(
            match(request.clone(), {
              cacheName,
            }),
          );
          return true;
        }
      } else if (event.request.url === request.url) {
        event.waitUntil(
          fetch(request.clone()).then(response => {
            if (isResponseSuccessful(response)) {
              event.waitUntil(
                put(request.clone(), response.clone(), {
                  cacheName,
                }),
              );
            }
          }),
        );
      }

      return false;
    };
  }
  return noop;
}
