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

import {
  isDevelopment,
  isServiceWorker,
  isEventsEnabled,
  isNonStandardEnabled,
  isNavigationPreloadEnabled,
  isServiceWorkerSupported,
  isNotificationSupported,
  isPushSupported,
  isBackgroundSyncSupported,
  isIndexedDBSupported,
  isCacheStorageSupported,
  isPermissionsSupported,
  isOffline,
} from '../../../src/utility/runtime/environment';
import { configure } from '../../../src';

beforeEach(() => {
  jest.resetModules();
});

describe('runtime environment utilities', () => {
  describe('isDevelopment', () => {
    test('isDevelopment correctly returns false', () => {
      configure({
        development: true,
      });
      const result = isDevelopment();
      expect(result).toBe(true);
    });

    test('isDevelopment correctly returns true', () => {
      configure({
        development: false,
      });
      const result = isDevelopment();
      expect(result).toBe(false);
    });
  });

  describe('isServiceWorker', () => {
    const { ServiceWorkerGlobalScope } = global.self;

    afterEach(() => {
      global.self.ServiceWorkerGlobalScope = ServiceWorkerGlobalScope;
    });

    test('isServiceWorker correctly returns false', () => {
      delete global.self.ServiceWorkerGlobalScope;
      const result = isServiceWorker();
      expect(result).toBe(false);
    });

    test('isServiceWorker correctly returns true', () => {
      const result = isServiceWorker();
      expect(result).toBe(true);
    });
  });

  describe('isEventsEnabled', () => {
    test('isEventsEnabled correctly returns false', () => {
      configure({
        events: false,
      });
      const result = isEventsEnabled();
      expect(result).toBe(false);
    });

    test('isEventsEnabled correctly returns true', () => {
      configure({
        events: true,
      });
      const result = isEventsEnabled();
      expect(result).toBe(true);
    });
  });

  describe('isNonStandardEnabled', () => {
    test('isNonStandardEnabled correctly returns false', () => {
      configure({
        nonStandard: false,
      });
      const result = isNonStandardEnabled();
      expect(result).toBe(false);
    });

    test('isNonStandardEnabled correctly returns true', () => {
      configure({
        nonStandard: true,
      });
      const result = isNonStandardEnabled();
      expect(result).toBe(true);
    });
  });

  describe('isNavigationPreloadEnabled', () => {
    test('isNavigationPreloadEnabled correctly returns false', () => {
      configure({
        navigationPreload: false,
      });
      const result = isNavigationPreloadEnabled();
      expect(result).toBe(false);
    });

    test('isNavigationPreloadEnabled correctly returns true', () => {
      configure({
        navigationPreload: true,
      });
      const result = isNavigationPreloadEnabled();
      expect(result).toBe(true);
    });
  });

  describe('isServiceWorkerSupported', () => {
    test('isServiceWorkerSupported correctly returns false', () => {
      const result = isServiceWorkerSupported();
      expect(result).toBe(false);
    });

    test('isServiceWorkerSupported correctly returns true', () => {
      navigator.serviceWorker = {};
      const result = isServiceWorkerSupported();
      expect(result).toBe(true);
    });
  });

  describe('isNotificationSupported', () => {
    test('isNotificationSupported correctly returns true', () => {
      const result = isNotificationSupported();
      expect(result).toBe(true);
    });

    test('isNotificationSupported correctly returns false', () => {
      delete self.Notification;
      const result = isNotificationSupported();
      expect(result).toBe(false);
    });
  });

  describe('isPushSupported', () => {
    test('isPushSupported correctly returns true', () => {
      const result = isPushSupported();
      expect(result).toBe(true);
    });

    test('isPushSupported correctly returns false', () => {
      delete self.PushManager;
      const result = isPushSupported();
      expect(result).toBe(false);
    });
  });

  describe('isBackgroundSyncSupported', () => {
    test('isBackgroundSyncSupported correctly returns true', () => {
      const result = isBackgroundSyncSupported();
      expect(result).toBe(true);
    });

    test('isBackgroundSyncSupported correctly returns false', () => {
      delete self.SyncManager;
      const result = isBackgroundSyncSupported();
      expect(result).toBe(false);
    });
  });

  describe('isIndexedDBSupported', () => {
    test('isIndexedDBSupported correctly returns true', () => {
      const result = isIndexedDBSupported();
      expect(result).toBe(true);
    });

    test('isIndexedDBSupported correctly returns false', () => {
      delete self.indexedDB;
      const result = isIndexedDBSupported();
      expect(result).toBe(false);
    });
  });

  describe('isCacheStorageSupported', () => {
    test('isCacheStorageSupported correctly returns true', () => {
      const result = isCacheStorageSupported();
      expect(result).toBe(true);
    });

    test('isCacheStorageSupported correctly returns false', () => {
      delete self.caches;
      const result = isCacheStorageSupported();
      expect(result).toBe(false);
    });
  });

  describe('isPermissionsSupported', () => {
    test('isPermissionsSupported correctly returns false', () => {
      const result = isPermissionsSupported();
      expect(result).toBe(false);
    });

    test('isPermissionsSupported correctly returns true', () => {
      navigator.permissions = {};
      const result = isPermissionsSupported();
      expect(result).toBe(true);
    });
  });

  describe('isOffline', () => {
    test('isOffline correctly returns false', () => {
      navigator.onLine = true;
      const result = isOffline();
      expect(result).toBe(false);
    });

    test('isOffline correctly returns true', () => {
      navigator.onLine = false;
      const result = isOffline();
      expect(result).toBe(true);
    });
  });
});
