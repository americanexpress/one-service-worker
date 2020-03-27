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
  isServiceWorker,
  isPushSupported,
  isNotificationSupported,
  isBackgroundSyncSupported,
  isServiceWorkerSupported,
} from '../utility/runtime';
import { emit } from '../utility/events';
import { failure, notSupported } from '../utility/errors';
import { urlBase64ToUint8Array } from './subscription';

// https://www.w3.org/TR/service-workers/#dom-serviceworkercontainer-getregistration
// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/getRegistration
export function getRegistration(scope) {
  if (isServiceWorker()) return Promise.resolve(self.registration);
  if (isServiceWorkerSupported()) return navigator.serviceWorker.getRegistration(scope);
  return Promise.reject(notSupported());
}

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/getRegistrations
export function getRegistrations() {
  if (isServiceWorker()) return Promise.resolve([self.registration]);
  if (isServiceWorkerSupported()) return navigator.serviceWorker.getRegistrations();
  return Promise.reject(notSupported());
}

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
export function register(url, { scope = '/', updateViaCache = 'none' } = {}) {
  if (isServiceWorker()) return Promise.resolve(self.registration);
  if (isServiceWorkerSupported()) {
    return navigator.serviceWorker
      .register(url, {
        scope,
        updateViaCache,
      })
      .then(registration => {
        emit('register', registration);
        return registration;
      })
      .catch(error => Promise.reject(failure('Registration', error)));
  }
  return Promise.reject(notSupported());
}

/*
  ServiceWorker (Worker)
  https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker
*/

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/controller
export function getWorker() {
  return getRegistration().then(
    ({ installing, waiting, active }) => installing || waiting || active,
  );
}

// https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage
export function postMessage(message, transfer) {
  if (isServiceWorker()) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Client
    if (transfer instanceof Client || transfer instanceof WindowClient)
      return Promise.resolve(transfer.postMessage(message));
  }

  return getWorker().then(controller => {
    if (controller) {
      return Promise.resolve(controller.postMessage(message, transfer));
    }

    return Promise.resolve();
  });
}

/*
  ServiceWorkerRegistration
  https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
*/

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update
export function update(scope) {
  return getRegistration(scope).then(registration => {
    if (registration) return registration.update();
    return Promise.resolve();
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/unregister
export function unregister(scope) {
  return getRegistration(scope).then(registration => {
    if (registration) {
      return registration.unregister().then(() => {
        emit('unregister', registration);
        return registration;
      });
    }
    return Promise.resolve();
  });
}

export function escapeHatch() {
  return getRegistrations().then(registrations => {
    if (registrations && registrations.length > 0) {
      return Promise.all(
        registrations.map(registration =>
          registration.unregister().then(() => {
            emit('unregister', registration);
            return registration;
          }),
        ),
      );
    }
    return Promise.resolve([]);
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
export function showNotification(title, options) {
  return getRegistration().then(registration => {
    if (isNotificationSupported() && registration)
      return registration.showNotification(title, options);
    return Promise.resolve();
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/getNotifications
export function getNotifications() {
  return getRegistration().then(registration => {
    if (isNotificationSupported() && registration) return registration.getNotifications();
    return Promise.resolve([]);
  });
}

/*
  PushManager -> registration.pushManager
  https://developer.mozilla.org/en-US/docs/Web/API/PushManager
*/

// https://developer.mozilla.org/en-US/docs/Web/API/PushManager/getSubscription
export function getSubscription() {
  return getRegistration().then(registration => {
    if (isPushSupported() && registration) return registration.pushManager.getSubscription();
    return Promise.resolve();
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe
export function subscribe({ userVisibleOnly = true, applicationServerKey = '' } = {}) {
  return getRegistration().then(registration => {
    if (isPushSupported() && registration) {
      let applicationPublicKey = applicationServerKey;

      if (applicationPublicKey instanceof Uint8Array === false) {
        applicationPublicKey = urlBase64ToUint8Array(applicationPublicKey);
      }

      const options = {
        userVisibleOnly,
        applicationServerKey: applicationPublicKey,
      };

      return registration.pushManager
        .subscribe(options)
        .then(function registerSubscription(subscription) {
          emit('subscribe', subscription);

          return subscription;
        })
        .catch(error => Promise.reject(failure('Push Subscribe', error)));
    }

    return Promise.resolve();
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/PushManager/unsubscribe
export function unsubscribe() {
  return getRegistration().then(registration => {
    if (isPushSupported() && registration) {
      return getSubscription().then(subscription => {
        if (subscription) {
          return subscription
            .unsubscribe()
            .then(function unregisterSubscription(result) {
              emit('unsubscribe', result);
              return result;
            })
            .catch(error => Promise.reject(failure('Push Unsubscribe', error)));
        }

        return Promise.resolve(subscription);
      });
    }

    return Promise.resolve(false);
  });
}

// NON STANDARD:

export function registerTag(tag) {
  return getRegistration().then(registration => {
    if (isBackgroundSyncSupported() && registration) {
      return registration.sync.register(tag).then(syncRegistration => {
        emit('registertag', syncRegistration);

        return syncRegistration;
      });
    }

    return Promise.resolve();
  });
}

export function getTags() {
  return getRegistration().then(registration => {
    if (isBackgroundSyncSupported() && registration) return registration.sync.getTags();

    return Promise.resolve([]);
  });
}
