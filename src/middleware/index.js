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

import { createMiddlewareFactory } from '../utility/events';

export const onInstall = createMiddlewareFactory();
export const onActivate = createMiddlewareFactory();
export const onMessage = createMiddlewareFactory();
export const onPush = createMiddlewareFactory();
export const onSync = createMiddlewareFactory();
export const onFetch = createMiddlewareFactory();

export { default as manifest } from './manifest';
export {
  createCacheBusting as cacheBusting,
  createCacheRouter as cacheRouter,
  createCacheStrategy as cacheStrategy,
  createPrecache as precache,
} from './caching';

export { default as expiration } from './expiration';
export { default as appShell } from './shell';

export {
  createClientsClaim as clientsClaim,
  createSkipWaiting as skipWaiting,
  createEscapeHatchRoute as escapeHatchRoute,
} from './lifecycle';

export { createMessageContext as messageContext, createMessenger as messenger } from './messenger';
export {
  createNavigationPreloadResponse as navigationPreloadResponse,
  createNavigationPreloadActivation as navigationPreloadActivation,
} from './navigationPreload';
