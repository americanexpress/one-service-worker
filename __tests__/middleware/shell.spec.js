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

import createAppShell from '../../src/middleware/shell';
import { createMiddlewareContext } from '../../src/utility/events';
import { isServiceWorker, isOffline } from '../../src/utility/runtime';
import { clear, put } from '../../src/cache';

import { createFetchEvent, waitFor } from '../helpers';

jest.mock('../../src/utility/runtime/environment');

describe('createAppShell', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clear();
  });
  beforeAll(() => {
    isServiceWorker.mockImplementation(() => true);
    isOffline.mockImplementation(() => false);
  });

  test('does nothing if not in the service worker', async () => {
    expect.assertions(3);

    isServiceWorker.mockImplementationOnce(() => false);

    const route = '/index.html';
    const handler = createAppShell({ route });
    const event = createFetchEvent(route);

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event)).toBe(undefined);
    expect(event.waitUntil).toHaveBeenCalledTimes(0);
  });

  test('does nothing when offline and request.mode does not equal "navigate"', async () => {
    expect.assertions(3);

    isOffline.mockImplementationOnce(() => true);

    const route = '/index.html';
    const handler = createAppShell({ route });
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(false);
    expect(event.waitUntil).toHaveBeenCalledTimes(0);
  });

  test('does nothing when the route does not match', async () => {
    expect.assertions(3);

    const route = '/index.html';
    const handler = createAppShell({ route });
    const event = createFetchEvent('/product.html');
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(false);
    expect(event.waitUntil).toHaveBeenCalledTimes(0);
  });

  test('when online, fetches the latest shell but does not place it in cache if bad http status', async () => {
    expect.assertions(4);

    global.fetch.mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 404 })));

    const route = '/index.html';
    const handler = createAppShell({
      route,
    });
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(false);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await waitFor(event.waitUntil);
    const match = await caches.match(new Request(route));
    expect(match).toEqual(null);
  });

  test('when online, fetches the latest shell and places it in cache if good http status', async () => {
    expect.assertions(4);

    const route = '/index.html';
    const handler = createAppShell({ route });
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(false);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await waitFor(event.waitUntil);
    await waitFor(event.waitUntil);
    const match = await caches.match(new Request(route));
    expect(match).toEqual(expect.any(Response));
  });

  test('when offline, responds from cache if request.mode === "navigate"', async () => {
    expect.assertions(4);

    isOffline.mockImplementationOnce(() => true);

    const route = '/index.html';
    const handler = createAppShell({ route });
    const event = createFetchEvent(route);
    event.request.mode = 'navigate';
    const context = createMiddlewareContext();

    const request = new Request(route);
    const response = new Response();
    await put(request.clone(), response.clone());

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(true);
    expect(event.respondWith).toHaveBeenCalledTimes(1);
    await waitFor(event.respondWith);
    const match = await caches.match(request.clone());
    expect(match).toEqual(response);
  });

  test('defaults to "/index.html" for shell route', async () => {
    expect.assertions(4);

    isOffline.mockImplementationOnce(() => true);

    const route = '/index.html';
    const handler = createAppShell();
    const event = createFetchEvent(route);
    event.request.mode = 'navigate';
    const context = createMiddlewareContext();

    const request = new Request(route);
    const response = new Response();
    await put(request.clone(), response.clone());

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(true);
    expect(event.respondWith).toHaveBeenCalledTimes(1);
    await waitFor(event.respondWith);
    const match = await caches.match(request.clone());
    expect(match).toEqual(response);
  });
});
