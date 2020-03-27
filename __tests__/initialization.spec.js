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

import initialization from '../src/initialization';

import { isServiceWorkerSupported, isServiceWorker, isEventsEnabled } from '../src/utility/runtime';
import { emit, emitter, eventListeners, on } from '../src/utility/events';

jest.mock('../src/utility/runtime/environment');
jest.mock('../src/utility/events/events');

describe('initialization', () => {
  beforeAll(() => {
    isEventsEnabled.mockImplementation(() => true);
  });
  beforeEach(() => {
    jest.clearAllMocks();
    eventListeners.clear();
  });

  test('initialization runs service worker setup when in service worker thread', () => {
    expect.assertions(4);

    isServiceWorker.mockImplementationOnce(() => true);
    isEventsEnabled.mockImplementationOnce(() => true);

    initialization();

    expect(isServiceWorkerSupported).not.toHaveBeenCalled();
    expect(isServiceWorker).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line no-restricted-globals
    expect(self.addEventListener).toHaveBeenCalledTimes(7);
    expect(emitter).toHaveBeenCalledTimes(1);
  });

  describe('client-side', () => {
    beforeAll(() => {
      navigator.serviceWorker = {
        // eslint-disable-next-line no-restricted-globals
        ready: Promise.resolve(self.registration),
      };
    });

    test('initialization runs client setup when in client thread', async () => {
      expect.assertions(4);

      isServiceWorker.mockImplementationOnce(() => false);
      isServiceWorkerSupported.mockImplementationOnce(() => true);

      initialization();

      expect(isServiceWorker).toHaveBeenCalledTimes(1);
      expect(isServiceWorkerSupported).toHaveBeenCalledTimes(1);
      expect(emitter).toHaveBeenCalledTimes(0);
      await navigator.serviceWorker.ready;
      expect(emitter).toHaveBeenCalledTimes(1);
    });

    test('client setup binds to registration and controller on registration', () => {
      expect.assertions(3);

      isServiceWorker.mockImplementationOnce(() => false);
      isServiceWorkerSupported.mockImplementationOnce(() => true);

      initialization();

      // eslint-disable-next-line no-restricted-globals
      self.registration.active = {
        addEventListener: jest.fn(),
        onstatechange: null,
      };
      // eslint-disable-next-line no-restricted-globals
      emit('registration', self.registration);

      expect(emitter).toHaveBeenCalledTimes(2);
      expect(isServiceWorker).toHaveBeenCalledTimes(1);
      expect(isServiceWorkerSupported).toHaveBeenCalledTimes(1);
    });

    test('controller onstatechange emits the state of the worker', () => {
      expect.assertions(4);

      isServiceWorker.mockImplementationOnce(() => false);
      isServiceWorkerSupported.mockImplementationOnce(() => true);

      initialization();

      expect(isServiceWorker).toHaveBeenCalledTimes(1);
      expect(isServiceWorkerSupported).toHaveBeenCalledTimes(1);

      const state = 'redundant';
      const event = {
        target: {
          state,
        },
      };
      const callback = jest.fn();
      on(state, callback);
      emit('statechange', event);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(event, expect.any(Object));
    });

    test('initialization does not run in client thread if service worker not supported', () => {
      expect.assertions(2);

      isServiceWorkerSupported.mockImplementationOnce(() => false);

      initialization();

      expect(isServiceWorker).toHaveBeenCalledTimes(1);
      expect(isServiceWorkerSupported).toHaveBeenCalledTimes(1);
    });
  });
});
