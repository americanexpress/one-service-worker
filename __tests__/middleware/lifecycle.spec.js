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

import {
  createSkipWaiting,
  createClientsClaim,
  createEscapeHatchRoute,
} from '../../src/middleware/lifecycle';
import { isServiceWorker } from '../../src/utility/runtime';

import { createFetchEvent, createEvent } from '../helpers';

jest.mock('../../src/utility/runtime/environment');

beforeAll(() => {
  isServiceWorker.mockImplementation(() => true);
});
beforeEach(async () => {
  jest.clearAllMocks();
  // eslint-disable-next-line no-restricted-globals
  jest.spyOn(self, 'skipWaiting');
});

describe('createSkipWaiting', () => {
  test('skipWaiting is called in service worker environment', () => {
    expect.assertions(4);

    const event = createEvent('install');
    const middleware = createSkipWaiting();

    expect(middleware(event)).toBeUndefined();
    expect(isServiceWorker).toHaveBeenCalledTimes(1);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line no-restricted-globals
    expect(self.skipWaiting).toHaveBeenCalledTimes(1);
  });

  test('does nothing if not service worker environment', () => {
    expect.assertions(4);

    isServiceWorker.mockImplementationOnce(() => false);

    const event = createEvent('install');
    const middleware = createSkipWaiting();

    expect(middleware(event)).toBeUndefined();
    expect(isServiceWorker).toHaveBeenCalledTimes(1);
    expect(event.waitUntil).toHaveBeenCalledTimes(0);
    // eslint-disable-next-line no-restricted-globals
    expect(self.skipWaiting).toHaveBeenCalledTimes(0);
  });
});

beforeEach(async () => {
  jest.clearAllMocks();

  // eslint-disable-next-line no-restricted-globals
  jest.spyOn(self.clients, 'claim');
});

beforeAll(() => {
  isServiceWorker.mockImplementation(() => true);
});

describe('createClientsClaim', () => {
  test('claims the clients if in service worker environment', () => {
    expect.assertions(4);

    const event = createEvent('activate');
    const middleware = createClientsClaim();

    expect(middleware(event)).toBeUndefined();
    expect(isServiceWorker).toHaveBeenCalledTimes(1);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line no-restricted-globals
    expect(self.clients.claim).toHaveBeenCalledTimes(1);
  });

  test('does nothing if not service worker environment', () => {
    expect.assertions(4);

    isServiceWorker.mockImplementationOnce(() => false);

    const event = createEvent('activate');
    const middleware = createClientsClaim();

    expect(middleware(event)).toBeUndefined();
    expect(isServiceWorker).toHaveBeenCalledTimes(1);
    expect(event.waitUntil).toHaveBeenCalledTimes(0);
    // eslint-disable-next-line no-restricted-globals
    expect(self.clients.claim).toHaveBeenCalledTimes(0);
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
});

describe('createEscapeHatchRoute', () => {
  test('returns a middleware function', () => {
    expect.assertions(1);

    const middleware = createEscapeHatchRoute();

    expect(middleware).toBeInstanceOf(Function);
  });

  test('does nothing if designated event.request does not match default route', () => {
    expect.assertions(1);

    const event = createFetchEvent();
    const middleware = createEscapeHatchRoute();

    expect(middleware(event)).toBeUndefined();
  });

  test('does nothing if designated event.request does not match given route', () => {
    expect.assertions(1);

    const route = '/escape-hatch';
    const event = createFetchEvent();
    const middleware = createEscapeHatchRoute({
      route,
    });

    expect(middleware(event)).toBeUndefined();
  });

  test('handles fetch event if event.request matches given route', () => {
    expect.assertions(5);

    const route = '/escape-hatch';
    const event = createFetchEvent(new Request(route));
    const middleware = createEscapeHatchRoute({
      route,
    });

    expect(middleware(event)).toBe(true);
    expect(event.respondWith).toHaveBeenCalledTimes(1);
    expect(event.respondWith).toHaveBeenCalledWith(
      new Response(null, {
        status: 202,
        statusText: 'OK',
      }),
    );
    expect(event.waitUntil).toHaveBeenCalledTimes(2);
    expect(global.self.registration.unregister).toHaveBeenCalledTimes(1);
  });

  test('handles fetch event if event.request matches route given as URL', () => {
    expect.assertions(4);

    // eslint-disable-next-line no-restricted-globals
    const route = new URL('/escape-hatch', location.href);
    const event = createFetchEvent(new Request(route));
    const middleware = createEscapeHatchRoute({
      route,
    });

    expect(middleware(event)).toBe(true);
    expect(event.respondWith).toHaveBeenCalledTimes(1);
    expect(event.waitUntil).toHaveBeenCalledTimes(2);
    expect(global.self.registration.unregister).toHaveBeenCalledTimes(1);
  });

  test('handles fetch event and responds with given response', () => {
    expect.assertions(5);

    const route = '/escape-hatch';
    const response = new Response('OK', {
      status: 200,
    });
    const event = createFetchEvent(new Request(route));
    const middleware = createEscapeHatchRoute({
      route,
      response,
    });

    expect(middleware(event)).toBe(true);
    expect(event.respondWith).toHaveBeenCalledTimes(1);
    expect(event.respondWith).toHaveBeenCalledWith(response);
    expect(event.waitUntil).toHaveBeenCalledTimes(2);
    expect(global.self.registration.unregister).toHaveBeenCalledTimes(1);
  });

  test('handles fetch event and responds but does not clear the cache', () => {
    expect.assertions(5);

    const route = '/escape-hatch';
    const response = new Response('OK', {
      status: 200,
    });
    const event = createFetchEvent(new Request(route));
    const middleware = createEscapeHatchRoute({
      route,
      response,
      clearCache: false,
    });

    expect(middleware(event)).toBe(true);
    expect(event.respondWith).toHaveBeenCalledTimes(1);
    expect(event.respondWith).toHaveBeenCalledWith(response);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    expect(global.self.registration.unregister).toHaveBeenCalledTimes(1);
  });
});
