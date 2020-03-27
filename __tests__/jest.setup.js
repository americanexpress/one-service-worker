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

require('@babel/polyfill');

(function setup({ target, useEvents, useNavigationPreload, useNonStandard }) {
  if (useEvents) process.env.ONE_SW_USE_EVENTS = true;
  if (useNonStandard) process.env.ONE_SW_USE_NON_STANDARD = true;
  if (useNavigationPreload) process.env.ONE_SW_USE_NAVIGATION_PRELOAD = true;

  jest.resetModules();

  const spies = [[global, ['fetch']]];

  if (target === 'client') {
    spies.push([global.window, ['addEventListener', 'removeEventListener']]);

    if (global.navigator.serviceWorker) {
      spies.push([
        global.navigator.serviceWorker,
        ['register', 'getRegistration', 'getRegistrations'],
      ]);
    }
  } else {
    spies.push(
      [global.self, ['skipWaiting', 'addEventListener']],
      [global.clients, ['claim', 'get', 'matchAll', 'openWindow']],
      [global.registration, ['unregister', 'getNotifications', 'showNotification']],
      [global.registration.navigationPreload, ['enable', 'disable']],
      [global.registration.pushManager, ['subscribe', 'getSubscription']],
      [global.registration.pushManager.subscription, ['unsubscribe']],
      [global.registration.sync, ['register', 'getTags']],
    );
  }

  spies.forEach(combo => {
    const [object, properties] = combo;

    if (object) {
      properties.forEach(property => {
        switch (property) {
          default:
            jest.spyOn(object, property);
            break;
          case 'getSubscription':
          case 'subscribe':
            object[property] = jest.fn(
              (
                options = {
                  userVisibleOnly: true,
                  applicationServerKey: new Uint8Array(0),
                },
              ) =>
                Promise.resolve(
                  Object.assign(global.registration.pushManager.subscription, { options }),
                ),
            );
            break;
        }
      });
    }
  });
})(global.options);
