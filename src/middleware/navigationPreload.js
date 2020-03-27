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

import { isNavigationPreloadEnabled, isServiceWorker, isOffline } from '../utility/runtime';
import { getRegistration } from '../core';

import { noop } from './utility';

export function createNavigationPreloadActivation() {
  if (isServiceWorker()) {
    return function navigationPreloadActivation(event) {
      if (isNavigationPreloadEnabled()) {
        event.waitUntil(
          getRegistration().then(registration => registration.navigationPreload.enable()),
        );
      }
    };
  }
  return noop;
}

export function createNavigationPreloadResponse(fallback = event => fetch(event.request.clone())) {
  if (isServiceWorker()) {
    // eslint-disable-next-line consistent-return
    return function navigationPreloadResponse(event) {
      if (isNavigationPreloadEnabled() && isOffline() === false) {
        if (event.request.mode === 'navigate') {
          event.respondWith(event.preloadResponse.then(preloaded => preloaded || fallback(event)));
          return true;
        }
      }
    };
  }
  return noop;
}
