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
  register,
  getRegistration,
  getRegistrations,
  getWorker,
  postMessage,
  update,
  unregister,
  escapeHatch,
  getNotifications,
  showNotification,
  getSubscription,
  subscribe,
  unsubscribe,
  registerTag,
  getTags,
} from '../../src/core/service-worker';
import { urlBase64ToUint8Array } from '../../src/core/subscription';
import {
  emit,
  isServiceWorker,
  isServiceWorkerSupported,
  isPushSupported,
  isBackgroundSyncSupported,
  isNotificationSupported,
  isEventsEnabled,
  failure,
  notSupported,
} from '../../src/utility';

jest.mock('../../src/utility/runtime/environment');
jest.mock('../../src/utility/events/events');

const { registration } = self;
const controller = {
  postMessage: jest.fn(),
  addEventListener: jest.fn(),
};
const sync = {
  getTags: jest.fn(() => Promise.resolve([])),
  register: jest.fn(() => Promise.resolve()),
};
const serviceWorker = {
  register: jest.fn(() => Promise.resolve(registration)),
  getRegistration: jest.fn(() => Promise.resolve(registration)),
  getRegistrations: jest.fn(() => Promise.resolve([registration])),
};

beforeAll(() => {
  jest.spyOn(registration, 'update');
  jest.spyOn(registration, 'unregister');
  jest.spyOn(registration, 'showNotification');
  jest.spyOn(registration, 'getNotifications');
  jest.spyOn(registration.pushManager, 'subscribe');
  jest.spyOn(registration.pushManager, 'getSubscription');

  isServiceWorker.mockImplementation(() => false);
  isServiceWorkerSupported.mockImplementation(() => true);
  isNotificationSupported.mockImplementation(() => true);
  isPushSupported.mockImplementation(() => true);
  isBackgroundSyncSupported.mockImplementation(() => true);
  isEventsEnabled.mockImplementation(() => true);
});

beforeEach(async () => {
  jest.clearAllMocks();

  registration.sync = sync;
  navigator.serviceWorker = {
    ...serviceWorker,
  };
});

afterEach(() => {
  delete navigator.serviceWorker;
});

describe('getWorker', () => {
  beforeEach(() => {
    self.registration.installing = controller;
  });
  afterAll(() => {
    self.registration.installing = null;
  });

  test('getWorker resolves to undefined if controller does not exist', async () => {
    expect.assertions(1);

    self.registration.installing = null;

    await expect(getWorker()).resolves.toEqual(null);
  });

  test('getWorker resolves to the existing registration', async () => {
    expect.assertions(1);

    await expect(getWorker()).resolves.toEqual(controller);
  });

  test('getWorker resolves to the existing registration in service worker mode', async () => {
    expect.assertions(1);

    isServiceWorker.mockImplementationOnce(() => true);

    await expect(getWorker()).resolves.toEqual(controller);
  });
});

describe('getRegistration', () => {
  test('getRegistration rejects if service worker not supported', async () => {
    expect.assertions(1);

    isServiceWorker.mockImplementationOnce(() => false);
    isServiceWorkerSupported.mockImplementationOnce(() => false);

    await expect(getRegistration()).rejects.toEqual(notSupported());
  });

  test('getRegistration resolves to undefined if no registration exist', async () => {
    expect.assertions(1);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve());

    await expect(getRegistration()).resolves.toEqual(undefined);
  });

  test('getRegistration resolves to the existing registration', async () => {
    expect.assertions(1);

    await expect(getRegistration()).resolves.toEqual(registration);
  });

  test('getRegistration resolves to the existing registration in service worker mode', async () => {
    expect.assertions(1);

    isServiceWorker.mockImplementationOnce(() => true);

    await expect(getRegistration()).resolves.toEqual(registration);
  });
});

describe('getRegistrations', () => {
  test('getRegistrations rejects if service worker not supported', async () => {
    expect.assertions(1);

    isServiceWorker.mockImplementationOnce(() => false);
    isServiceWorkerSupported.mockImplementationOnce(() => false);

    await expect(getRegistrations()).rejects.toEqual(notSupported());
  });

  test('getRegistrations resolves to an empty array if no registrations exist', async () => {
    expect.assertions(1);

    serviceWorker.getRegistrations.mockImplementationOnce(() => Promise.resolve([]));

    await expect(getRegistrations()).resolves.toEqual([]);
  });

  test('getRegistrations resolves to an array with existing registrations', async () => {
    expect.assertions(1);

    await expect(getRegistrations()).resolves.toEqual([registration]);
  });

  test('getRegistrations resolves to the existing registration in service worker mode', async () => {
    expect.assertions(1);

    isServiceWorker.mockImplementationOnce(() => true);

    await expect(getRegistrations()).resolves.toEqual([registration]);
  });
});

describe('register', () => {
  const url = '/sw.js';
  const scope = '/';
  const updateViaCache = 'none';

  test('registering a service worker rejects if service worker not supported', async () => {
    expect.assertions(4);

    isServiceWorker
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => false);
    isServiceWorkerSupported
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => false);

    await expect(register()).rejects.toEqual(notSupported());
    await expect(register(url)).rejects.toEqual(notSupported());
    await expect(
      register(url, {
        scope,
      }),
    ).rejects.toEqual(notSupported());
    await expect(
      register(url, {
        scope,
        updateViaCache,
      }),
    ).rejects.toEqual(notSupported());
  });

  test('registering reject if registration fails', async () => {
    expect.assertions(1);

    isServiceWorker.mockImplementationOnce(() => false);
    serviceWorker.register.mockImplementationOnce(() => Promise.reject(failure()));

    await expect(register()).rejects.toEqual(failure('Registration', failure()));
  });

  test('registering resolves with registration', async () => {
    expect.assertions(2);

    await expect(register(url)).resolves.toEqual(registration);
    expect(emit).toHaveBeenCalledTimes(1);
  });

  test('register resolves to the existing registration in service worker mode', async () => {
    expect.assertions(1);

    isServiceWorker.mockImplementationOnce(() => true);

    await expect(register()).resolves.toEqual(registration);
  });
});

describe('postMessage', () => {
  const message = 'communicating over the wire';
  const client = new Client();
  const windowClient = new WindowClient();

  beforeAll(() => {
    jest.spyOn(client, 'postMessage');
    jest.spyOn(windowClient, 'postMessage');
  });

  test('postMessage resolves to undefined', async () => {
    expect.assertions(1);

    self.registration.installing = null;
    await expect(postMessage()).resolves.toEqual(undefined);
  });

  test('postMessage resolves to undefined and calls postMessage if controller does not exist', async () => {
    expect.assertions(2);

    await expect(postMessage(message)).resolves.toEqual(undefined);
    expect(controller.postMessage).toHaveBeenCalledTimes(0);
  });

  test('postMessage resolves to undefined and calls postMessage if controller exists', async () => {
    expect.assertions(3);

    self.registration.installing = controller;

    await expect(postMessage(message)).resolves.toEqual(undefined);
    expect(controller.postMessage).toHaveBeenCalledTimes(1);
    expect(controller.postMessage).toHaveBeenCalledWith(message, undefined);
  });

  describe('service worker thread', () => {
    test('postMessage resolves to undefined and calls postMessage with client transfer', async () => {
      expect.assertions(4);

      isServiceWorker.mockImplementationOnce(() => true).mockImplementationOnce(() => true);

      await expect(postMessage(message, client)).resolves.toEqual(undefined);
      await expect(postMessage(message, windowClient)).resolves.toEqual(undefined);
      expect(client.postMessage).toHaveBeenCalledTimes(1);
      expect(windowClient.postMessage).toHaveBeenCalledTimes(1);
    });

    test('postMessage resolves to undefined', async () => {
      expect.assertions(3);

      isServiceWorker.mockImplementationOnce(() => true).mockImplementationOnce(() => true);
      const transfer = {};
      await expect(postMessage(message, transfer)).resolves.toEqual(undefined);
      expect(self.registration.installing.postMessage).toHaveBeenCalledTimes(1);
      expect(self.registration.installing.postMessage).toHaveBeenCalledWith(message, transfer);
    });
  });
});

describe('update', () => {
  test('update resolves to undefined and calls registration.update', async () => {
    expect.assertions(2);

    await expect(update()).resolves.toEqual(undefined);
    expect(registration.update).toHaveBeenCalledTimes(1);
  });

  test('update resolves to undefined and does not call registration.update', async () => {
    expect.assertions(2);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve());

    await expect(update()).resolves.toEqual(undefined);
    expect(registration.update).not.toHaveBeenCalled();
  });
});

describe('unregister', () => {
  test('unregister rejects if service worker not supported', async () => {
    expect.assertions(1);

    isServiceWorkerSupported.mockImplementationOnce(() => false);

    await expect(unregister()).rejects.toEqual(notSupported());
  });

  test('unregister resolves to unregistered registration and calls registration.unregister', async () => {
    expect.assertions(2);

    await expect(unregister()).resolves.toEqual(registration);
    await expect(registration.unregister).toHaveBeenCalledTimes(1);
  });

  test('unregister resolves to undefined if registration does not exist', async () => {
    expect.assertions(1);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve());

    await expect(unregister()).resolves.toEqual(undefined);
  });
});

describe('escapeHatch', () => {
  test('escapeHatch rejects if service worker not supported', async () => {
    expect.assertions(1);

    isServiceWorkerSupported.mockImplementationOnce(() => false);

    await expect(escapeHatch()).rejects.toEqual(notSupported());
  });

  test('escapeHatch resolves to unregistered registrations and calls registration.unregister', async () => {
    expect.assertions(2);

    await expect(escapeHatch()).resolves.toEqual([registration]);
    expect(registration.unregister).toHaveBeenCalledTimes(1);
  });

  test('escapeHatch resolves to undefined if registrations does not exist', async () => {
    expect.assertions(2);

    serviceWorker.getRegistrations.mockImplementationOnce(() => Promise.resolve([]));

    await expect(escapeHatch()).resolves.toEqual([]);
    expect(registration.unregister).not.toHaveBeenCalled();
  });
});

describe('showNotification', () => {
  const title = 'new notification';
  const options = {
    vibrate: [100, 200],
  };

  test('showNotification resolves to undefined if not supported', async () => {
    expect.assertions(2);

    isNotificationSupported.mockImplementationOnce(() => false);

    await expect(showNotification()).resolves.toEqual(undefined);
    expect(registration.showNotification).not.toHaveBeenCalled();
  });

  test('showNotification calls registration.showNotification', async () => {
    expect.assertions(2);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));

    await expect(showNotification(title, options)).resolves.toMatchObject({
      notification: new Notification(title, options),
    });
    expect(registration.showNotification).toHaveBeenCalledTimes(1);
  });
});

describe('getNotifications', () => {
  test('getNotifications resolves to an empty array if not supported', async () => {
    expect.assertions(2);

    isNotificationSupported.mockImplementationOnce(() => false);

    await expect(getNotifications()).resolves.toEqual([]);
    expect(registration.getNotifications).not.toHaveBeenCalled();
  });

  test('getNotifications calls registration.getNotifications', async () => {
    expect.assertions(2);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));

    await expect(getNotifications()).resolves.toMatchSnapshot();
    expect(registration.getNotifications).toHaveBeenCalledTimes(1);
  });
});

describe('getSubscription', () => {
  test('getSubscription resolves to undefined if not supported', async () => {
    expect.assertions(1);

    isPushSupported.mockImplementationOnce(() => false);

    await expect(getSubscription()).resolves.toEqual(undefined);
  });

  test('getSubscription calls registration.pushManager.getSubscription', async () => {
    expect.assertions(2);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));

    await expect(getSubscription()).resolves.toMatchSnapshot();
    expect(registration.pushManager.getSubscription).toHaveBeenCalledTimes(1);
  });
});

describe('subscribe', () => {
  test('subscribe resolves to undefined if not supported', async () => {
    expect.assertions(1);

    isPushSupported.mockImplementationOnce(() => false);

    await expect(subscribe()).resolves.toEqual(undefined);
  });

  test('subscribe calls registration.pushManager.subscribe', async () => {
    expect.assertions(3);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));
    isEventsEnabled.mockImplementationOnce(() => true);

    await expect(subscribe()).resolves.toMatchSnapshot();
    expect(registration.pushManager.subscribe).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledTimes(1);
  });

  test('subscribe rejects with error', async () => {
    expect.assertions(3);

    const error = new Error('subscribe failure');
    registration.pushManager.subscribe.mockImplementationOnce(() => Promise.reject(error));
    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));

    await expect(subscribe()).rejects.toEqual(failure('Push Subscribe', error));
    expect(registration.pushManager.subscribe).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledTimes(0);
  });

  test('subscribe transforms applicationServerKey to urlBase64ToUint8Array if its a string', async () => {
    expect.assertions(3);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));

    await expect(
      subscribe({
        applicationServerKey: 'applicationServerKey',
      }),
    ).resolves.toMatchSnapshot();
    expect(registration.pushManager.subscribe).toHaveBeenCalledTimes(1);
    expect(registration.pushManager.subscribe).toHaveBeenCalledWith({
      applicationServerKey: urlBase64ToUint8Array('applicationServerKey'),
      userVisibleOnly: true,
    });
  });

  test('subscribe does not transforms applicationServerKey if in the right format', async () => {
    expect.assertions(3);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));

    await expect(
      subscribe({
        applicationServerKey: urlBase64ToUint8Array('applicationServerKey'),
      }),
    ).resolves.toMatchSnapshot();
    expect(registration.pushManager.subscribe).toHaveBeenCalledTimes(1);
    expect(registration.pushManager.subscribe).toHaveBeenCalledWith({
      applicationServerKey: urlBase64ToUint8Array('applicationServerKey'),
      userVisibleOnly: true,
    });
  });
});

describe('unsubscribe', () => {
  let subscription;

  beforeEach(async () => {
    subscription = await registration.pushManager.getSubscription();
    jest.spyOn(subscription, 'unsubscribe');
    registration.pushManager.getSubscription.mockImplementation(() =>
      Promise.resolve(subscription),
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('unsubscribe resolves to undefined if not supported', async () => {
    expect.assertions(1);

    isPushSupported.mockImplementationOnce(() => false);

    await expect(unsubscribe()).resolves.toEqual(false);
  });

  test('unsubscribe resolves to undefined if subscription not found', async () => {
    expect.assertions(1);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));
    registration.pushManager.getSubscription.mockImplementationOnce(() => Promise.resolve());

    await expect(unsubscribe()).resolves.toEqual(undefined);
  });

  test('unsubscribe calls subscription.unsubscribe', async () => {
    expect.assertions(3);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));
    isEventsEnabled.mockImplementationOnce(() => true);

    await expect(unsubscribe()).resolves.toMatchSnapshot();
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledTimes(1);
  });

  test('unsubscribe rejects with error', async () => {
    expect.assertions(3);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));
    isEventsEnabled.mockImplementationOnce(() => true);
    const error = new Error('unsubscribe failure');

    subscription.unsubscribe.mockImplementationOnce(() => Promise.reject(error));

    await expect(unsubscribe()).rejects.toEqual(failure('Push Unsubscribe', error));
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledTimes(0);
  });

  test('unsubscribe calls subscription.unsubscribe and returns false if unsuccessful', async () => {
    expect.assertions(3);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));
    subscription.unsubscribe.mockImplementationOnce(() => Promise.resolve(false));

    await expect(unsubscribe()).resolves.toEqual(false);
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledTimes(1);
  });
});

describe('registerTag', () => {
  test('registerTag resolves to undefined if not supported', async () => {
    expect.assertions(1);

    isBackgroundSyncSupported.mockImplementationOnce(() => false);

    await expect(registerTag()).resolves.toEqual(undefined);
  });

  test('registerTag resolves to undefined and calls registration.sync.register', async () => {
    expect.assertions(2);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));

    await expect(registerTag()).resolves.toEqual(undefined);
    expect(sync.register).toHaveBeenCalledTimes(1);
  });

  test('registerTag resolves to undefined and calls emit', async () => {
    expect.assertions(3);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));
    isEventsEnabled.mockImplementationOnce(() => true);

    await expect(registerTag()).resolves.toEqual(undefined);
    expect(sync.register).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledTimes(1);
  });
});

describe('getTags', () => {
  test('getTags resolves to an empty array if not supported', async () => {
    expect.assertions(1);

    isBackgroundSyncSupported.mockImplementationOnce(() => false);

    await expect(getTags()).resolves.toEqual([]);
  });

  test('getTags resolves to an empty array and calls registration.sync.getTags', async () => {
    expect.assertions(2);

    serviceWorker.getRegistration.mockImplementationOnce(() => Promise.resolve(registration));

    await expect(getTags()).resolves.toEqual([]);
    expect(sync.getTags).toHaveBeenCalledTimes(1);
  });
});
