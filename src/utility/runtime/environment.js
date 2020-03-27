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

/* eslint-disable no-restricted-globals */
import { getConfig } from './config';

// mode

export function isDevelopment() {
  return getConfig().development;
}

// configuration

export function isEventsEnabled() {
  return getConfig().events;
}

export function isNonStandardEnabled() {
  return getConfig().nonStandard;
}

export function isNavigationPreloadEnabled() {
  return getConfig().navigationPreload;
}

// environment checks

export function isServiceWorker() {
  return 'ServiceWorkerGlobalScope' in self;
}

export function isServiceWorkerSupported() {
  return 'serviceWorker' in navigator;
}

export function isNotificationSupported() {
  return 'Notification' in self;
}

export function isPushSupported() {
  return 'PushManager' in self;
}

export function isBackgroundSyncSupported() {
  return 'SyncManager' in self;
}

export function isCacheStorageSupported() {
  return 'caches' in self;
}

export function isIndexedDBSupported() {
  return 'indexedDB' in self;
}

export function isPermissionsSupported() {
  return 'permissions' in navigator;
}

export function isOffline() {
  return navigator.onLine === false;
}
