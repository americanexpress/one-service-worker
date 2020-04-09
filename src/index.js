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

import initialize from './initialization';

initialize();

export {
  on,
  once,
  off,
  emit,
  emitter,
  eventListeners,
  calls,
  createMiddleware,
  createMiddlewareContext,
  createMiddlewareFactory,
} from './utility/events';
export {
  TYPES,
  ENUMS,
  expectedType,
  expectedArrayOfType,
  enumerableException,
  unknownKey,
  unknownEventName,
  validateInput,
  getCacheOptions,
} from './utility/validation';
export {
  OneServiceWorkerError,
  errorFactory,
  notEnabled,
  notSupported,
  failedToInstall,
  failure,
} from './utility/errors';
export {
  configure,
  getConfig,
  isDevelopment,
  isEventsEnabled,
  isNonStandardEnabled,
  isNavigationPreloadEnabled,
  isServiceWorker,
  isServiceWorkerSupported,
  isNotificationSupported,
  isPushSupported,
  isBackgroundSyncSupported,
  isCacheStorageSupported,
  isIndexedDBSupported,
  isPermissionsSupported,
  isOffline,
} from './utility/runtime';

export {
  getRegistration,
  getRegistrations,
  register,
  getWorker,
  postMessage,
  update,
  unregister,
  escapeHatch,
  showNotification,
  getNotifications,
  getSubscription,
  subscribe,
  unsubscribe,
  registerTag,
  getTags,
  urlBase64ToUint8Array,
} from './core';

export {
  defaultCacheName,
  defaultCacheOptions,
  normalizeRequest,
  open,
  has,
  keys,
  match,
  matchAll,
  add,
  addAll,
  put,
  remove,
  removeAll,
  entries,
  clear,
  metaDataCacheName,
  createCacheName,
  createCacheEntryName,
  createMetaRequest,
  createMetaResponse,
  getMetaStore,
  getMetaData,
  setMetaData,
  deleteMetaData,
} from './cache';

export {
  onInstall,
  onActivate,
  onMessage,
  onPush,
  onSync,
  onFetch,
  cacheBusting,
  cacheRouter,
  cacheStrategy,
  clientsClaim,
  escapeHatchRoute,
  manifest,
  messageContext,
  messenger,
  navigationPreloadActivation,
  navigationPreloadResponse,
  appShell,
  precache,
  skipWaiting,
  expiration,
} from './middleware';
