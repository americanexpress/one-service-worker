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

import { isServiceWorker } from '../utility/runtime';
import { clear, normalizeRequest } from '../cache';

export const defaultEscapeRoute = '/__sw/__escape';

export function createEscapeHatchRoute({
  route = defaultEscapeRoute,
  response = new Response(null, {
    status: 202,
    statusText: 'OK',
  }),
  clearCache = true,
} = {}) {
  const { url } = normalizeRequest(route);
  // eslint-disable-next-line consistent-return
  return function escapeHatchRoute(event) {
    if (event.request.url === url) {
      event.respondWith(response.clone());
      if (clearCache) event.waitUntil(clear());
      // eslint-disable-next-line no-restricted-globals
      event.waitUntil(self.registration.unregister());
      return true;
    }
  };
}

export function createSkipWaiting() {
  return function skipWaiting(event) {
    if (isServiceWorker()) {
      // eslint-disable-next-line no-restricted-globals
      event.waitUntil(self.skipWaiting());
    }
  };
}

export function createClientsClaim() {
  // TODO: request to claim from open windows as an opt-in with client-side mechanism
  return function clientsClaim(event) {
    if (isServiceWorker()) {
      // eslint-disable-next-line no-restricted-globals
      event.waitUntil(self.clients.claim());
    }
  };
}
