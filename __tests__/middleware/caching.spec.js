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
  createCacheRouter,
  createCacheStrategy,
  createCacheBusting,
  createPrecache,
} from '../../src/middleware/caching';

import { match, clear, add } from '../../src/cache';
import { createMiddlewareContext } from '../../src/utility/events';
import { isServiceWorker, isCacheStorageSupported } from '../../src/utility/runtime';

import { createFetchEvent, waitFor } from '../helpers';

jest.mock('../../src/utility/runtime/environment');

beforeAll(() => {
  isServiceWorker.mockImplementation(() => true);
  isCacheStorageSupported.mockImplementation(() => true);
});
beforeEach(async () => {
  jest.clearAllMocks();
  await clear();
});

describe('middleware', () => {
  test('middleware do nothing when not in service worker', () => {
    isServiceWorker.mockImplementation(() => false);

    const middleware = [
      createCacheRouter(),
      createCacheStrategy(),
      createCacheBusting(),
      createPrecache(),
    ];

    expect.assertions(middleware.length * 2);

    middleware.forEach(handler => {
      expect(handler).toBeInstanceOf(Function);
      expect(handler()).toBeUndefined();
    });

    isServiceWorker.mockImplementation(() => true);
  });

  test('middleware do nothing when caching is not supported', () => {
    isCacheStorageSupported.mockImplementation(() => false);

    const middleware = [
      createCacheRouter(),
      createCacheStrategy(),
      createCacheBusting(),
      createPrecache(),
    ];

    expect.assertions(middleware.length * 2);

    middleware.forEach(handler => {
      expect(handler).toBeInstanceOf(Function);
      expect(handler()).toBeUndefined();
    });

    isCacheStorageSupported.mockImplementation(() => true);
  });

  test('middleware runs without arguments', () => {
    const middleware = [
      createCacheRouter(),
      createCacheStrategy(),
      createCacheBusting(),
      createPrecache(),
    ];

    expect.assertions(middleware.length * 3);

    const context = createMiddlewareContext();

    middleware.forEach(handler => {
      const event = createFetchEvent('/');
      expect(handler).toBeInstanceOf(Function);
      expect(() => handler(event, context)).not.toThrow();
      expect(context.get()).toEqual({});
    });
  });
});

describe('createCacheRouter', () => {
  test('returns undefined by default', async () => {
    expect.assertions(2);

    const handler = createCacheRouter();

    expect(handler).toBeInstanceOf(Function);
    expect(handler()).toBe(undefined);
  });

  test('on match, adds the request to cache', async () => {
    expect.assertions(6);

    const route = '/module.js';
    const handler = createCacheRouter({ match: () => true });
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(true);

    expect(event.respondWith).toHaveBeenCalledTimes(1);
    await waitFor(event.respondWith);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await waitFor(event.waitUntil);

    await expect(match(route)).resolves.toBeInstanceOf(Response);
    expect(context.get()).toEqual({
      cacheName: expect.any(String),
      request: event.request,
    });
  });

  test('on match using regexp, adds the request to cache and responds from cache afterwards', async () => {
    expect.assertions(12);

    const route = '/module.js';
    const handler = createCacheRouter({ match: /module/ });
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(true);

    expect(event.respondWith).toHaveBeenCalledTimes(1);
    await waitFor(event.respondWith);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await waitFor(event.waitUntil);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(event.request, undefined);

    // context set by middleware
    expect(context.get()).toEqual({
      cacheName: expect.any(String),
      request: event.request,
    });

    // we should have the request cached
    await expect(match(route)).resolves.toBeInstanceOf(Response);

    // if in the cache, will use the cached route
    expect(handler(event, context)).toBe(true);

    expect(event.respondWith).toHaveBeenCalledTimes(2);
    await waitFor(event.respondWith);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await waitFor(event.waitUntil);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('can designate cache and fetchOptions for handling matched requests', async () => {
    expect.assertions(7);

    const route = '/module.js';
    const cacheName = 'my-cache';
    const fetchOptions = {};
    const handler = createCacheRouter({
      match: () => true,
      fetchOptions,
      cacheName,
    });
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(true);

    expect(event.respondWith).toHaveBeenCalledTimes(1);
    await waitFor(event.respondWith);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await waitFor(event.waitUntil);

    expect(global.fetch).toHaveBeenCalledWith(event.request, fetchOptions);

    await expect(match(route)).resolves.toBeInstanceOf(Response);
    expect(context.get()).toEqual({
      cacheName: expect.any(String),
      request: event.request,
    });
  });
});

describe('createCacheStrategy', () => {
  test('responds from cache', async () => {
    expect.assertions(7);

    const route = '/module.js';
    const handler = createCacheStrategy();
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    await add(route);

    const matchedRoute = await match(route);

    expect(matchedRoute).toBeInstanceOf(Response);
    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(true);
    expect(context.get()).toEqual({});
    expect(event.waitUntil).toHaveBeenCalledTimes(1);

    await waitFor(event.waitUntil);

    expect(event.respondWith).toHaveBeenCalledTimes(1);
    expect(event.respondWith).toHaveBeenCalledWith(matchedRoute);
  });
});

describe('createPrecache', () => {
  test('middleware returns undefined if requests array is empty', async () => {
    expect.assertions(2);

    const handler = createPrecache();

    expect(handler).toBeInstanceOf(Function);
    expect(handler()).toBe(undefined);
  });

  test('middleware adds the requests to cache', async () => {
    expect.assertions(4);

    const route = '/module.js';
    const handler = createPrecache([route]);
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBeUndefined();
    expect(event.waitUntil).toHaveBeenCalledTimes(1);

    await waitFor(event.waitUntil);

    await expect(match(route)).resolves.toBeInstanceOf(Response);
  });
});
