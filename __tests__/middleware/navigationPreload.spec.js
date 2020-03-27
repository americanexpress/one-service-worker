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
  createNavigationPreloadResponse,
  createNavigationPreloadActivation,
} from '../../src/middleware/navigationPreload';
import { createMiddlewareContext } from '../../src/utility/events';
import { isServiceWorker, isOffline, isNavigationPreloadEnabled } from '../../src/utility/runtime';
import { getRegistration } from '../../src/core';

import { createFetchEvent, waitFor } from '../helpers';

jest.mock('../../src/utility/runtime/environment');

describe('createNavigationPreloadActivation', () => {
  beforeAll(() => {
    isServiceWorker.mockImplementation(() => true);
    isNavigationPreloadEnabled.mockImplementation(() => true);
  });

  test('does nothing if not in the service worker', async () => {
    expect.assertions(3);

    isServiceWorker.mockImplementationOnce(() => false);
    const route = '/index.html';
    const handler = createNavigationPreloadActivation();
    const event = createFetchEvent(route);

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event)).toBe(undefined);
    expect(event.waitUntil).toHaveBeenCalledTimes(0);
  });

  test('does nothing if navigation preload not supported', async () => {
    expect.assertions(3);

    isNavigationPreloadEnabled.mockImplementationOnce(() => false);
    const route = '/index.html';
    const handler = createNavigationPreloadActivation();
    const event = createFetchEvent(route);

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event)).toBe(undefined);
    expect(event.waitUntil).toHaveBeenCalledTimes(0);
  });

  test('middleware sets the given route', async () => {
    expect.assertions(3);

    const route = '/index.html';
    const handler = createNavigationPreloadActivation();
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler(event, context)).toBeUndefined();
    await waitFor(event.waitUntil);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line no-restricted-globals
    const registration = await getRegistration();
    expect(registration.navigationPreload.enable).toHaveBeenCalledTimes(1);
  });
});

describe('createNavigationPreloadResponse', () => {
  beforeAll(() => {
    isServiceWorker.mockImplementation(() => true);
    isNavigationPreloadEnabled.mockImplementation(() => true);
  });

  test('does nothing if not in the service worker', async () => {
    expect.assertions(3);

    isServiceWorker.mockImplementationOnce(() => false);
    const route = '/index.html';
    const handler = createNavigationPreloadResponse();
    const event = createFetchEvent(route);

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event)).toBe(undefined);
    expect(event.respondWith).toHaveBeenCalledTimes(0);
  });

  test('does nothing if navigation preload not supported', async () => {
    expect.assertions(3);

    isNavigationPreloadEnabled.mockImplementationOnce(() => false);
    const route = '/index.html';
    const handler = createNavigationPreloadResponse();
    const event = createFetchEvent(route);

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event)).toBe(undefined);
    expect(event.respondWith).toHaveBeenCalledTimes(0);
  });

  test('does nothing if the request.mode !== "navigate"', async () => {
    expect.assertions(2);

    isOffline.mockImplementationOnce(() => false);

    const route = '/index.html';
    const handler = createNavigationPreloadResponse();
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler(event, context)).toBeUndefined();
    expect(event.respondWith).toHaveBeenCalledTimes(0);
  });

  test('handles response and falls back to default fallback', async () => {
    expect.assertions(2);

    isOffline.mockImplementationOnce(() => false);

    const route = '/index.html';
    const handler = createNavigationPreloadResponse();
    const event = createFetchEvent(route);
    event.request.mode = 'navigate';
    event.preloadResponse = Promise.resolve();
    const context = createMiddlewareContext();

    expect(handler(event, context)).toBe(true);
    await waitFor(event.respondWith);
    expect(event.respondWith).toHaveBeenCalledTimes(1);
  });

  test('does not fallback if preloadResponse resolve to be defined', async () => {
    expect.assertions(3);

    isOffline.mockImplementationOnce(() => false);

    const route = '/index.html';
    const event = createFetchEvent(route);
    event.request.mode = 'navigate';
    const response = new Response('<!doctype html>', { url: event.request.url });
    event.preloadResponse = Promise.resolve(response);
    const fallback = jest.fn();
    const context = createMiddlewareContext();
    const handler = createNavigationPreloadResponse(fallback);

    expect(handler(event, context)).toBe(true);
    await waitFor(event.respondWith);
    expect(event.respondWith).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenCalledTimes(0);
  });

  test('fallback is called if preloadResponse resolve to be undefined', async () => {
    expect.assertions(3);

    isOffline.mockImplementationOnce(() => false);

    const route = '/index.html';
    const event = createFetchEvent(route);
    event.request.mode = 'navigate';
    const response = new Response('<!doctype html>', { url: event.request.url });
    event.preloadResponse = Promise.resolve(null);
    const fallback = jest.fn(() => Promise.resolve(response));
    const context = createMiddlewareContext();
    const handler = createNavigationPreloadResponse(fallback);

    expect(handler(event, context)).toBe(true);
    await waitFor(event.respondWith);
    expect(event.respondWith).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenCalledTimes(1);
  });
});
