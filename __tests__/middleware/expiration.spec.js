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

import createExpirationMiddleware from '../../src/middleware/expiration';
import {
  createMetaCacheName,
  createMetaRequest,
  getMetaData,
  setMetaData,
  deleteMetaData,
} from '../../src/cache/meta-data';
import { match, clear, remove } from '../../src/cache/cache';
import { isServiceWorker, isCacheStorageSupported } from '../../src/utility/runtime';

import { createFetchEvent, waitFor } from '../helpers';
import { createMiddlewareContext } from '../../src/utility/events';

jest.mock('../../src/cache/cache');
jest.mock('../../src/cache/meta-data');
jest.mock('../../src/utility/runtime/environment');

jest.spyOn(Date, 'now');

beforeAll(() => {
  isCacheStorageSupported.mockImplementation(() => true);
  isServiceWorker.mockImplementation(() => true);
});
beforeEach(async () => {
  await clear();
  jest.clearAllMocks();
});

describe('createExpirationMiddleware', () => {
  test('does nothing when not in service worker', () => {
    expect.assertions(2);

    isServiceWorker.mockImplementationOnce(() => false);

    const handler = createExpirationMiddleware();
    expect(handler).toBeInstanceOf(Function);
    expect(handler()).toBeUndefined();
  });

  test('does nothing when caching is not supported', () => {
    expect.assertions(2);

    isCacheStorageSupported.mockImplementationOnce(() => false);

    const handler = createExpirationMiddleware();
    expect(handler).toBeInstanceOf(Function);
    expect(handler()).toBeUndefined();
  });

  test('does nothing if request not found in context', async () => {
    expect.assertions(3);

    const handler = createExpirationMiddleware();
    const event = createFetchEvent('/main.js');
    const context = {
      get: jest.fn(() =>
        createMiddlewareContext(() => ({
          request: event.request.clone(),
        })),
      ),
    };

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBeUndefined();
    expect(event.waitUntil).not.toHaveBeenCalled();
  });

  test('adds metadata for the request', async () => {
    expect.assertions(4);

    const handler = createExpirationMiddleware();
    const event = createFetchEvent('/index.html');
    const context = { get: jest.fn(() => ({ request: event.request.clone() })) };

    expect(handler(event, context)).toBeUndefined();
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await waitFor(event.waitUntil);
    await expect(
      match(createMetaRequest(), {
        cacheName: createMetaCacheName(),
      }),
    ).resolves.toBeInstanceOf(Response);
    await expect(
      getMetaData({
        url: event.request.url,
      }),
    ).resolves.toEqual({
      expires: expect.any(Number),
    });
  });

  test('updates metadata expiration for the request', async () => {
    Date.now.mockReturnValueOnce(1680124877877).mockReturnValueOnce(1680124958411);
    expect.assertions(7);

    const handler = createExpirationMiddleware();
    const event = createFetchEvent('/index.html');
    const context = { get: jest.fn(() => ({ request: event.request.clone() })) };

    expect(handler(event, context)).toBeUndefined();
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await waitFor(event.waitUntil);
    await expect(
      match(createMetaRequest(), {
        cacheName: createMetaCacheName(),
      }),
    ).resolves.toBeInstanceOf(Response);
    await expect(
      getMetaData({
        url: event.request.url,
      }),
    ).resolves.toEqual({
      expires: expect.any(Number),
    });

    const meta = await getMetaData({
      url: event.request.url,
    });
    expect(handler(event, context)).toBeUndefined();
    await waitFor(event.waitUntil);
    const updatedMeta = await getMetaData({
      url: event.request.url,
    });
    expect(updatedMeta).not.toEqual(meta);
    expect(updatedMeta.expires).toBeGreaterThan(meta.expires);
  });

  test('updates metadata for the request without removing existing keys', async () => {
    expect.assertions(4);

    const handler = createExpirationMiddleware();
    const event = createFetchEvent('/index.html');
    const context = {
      get: jest.fn(() => ({
        request: event.request.clone(),
      })),
    };

    await setMetaData({
      url: event.request.url,
      metadata: {
        random: 'value',
      },
    });

    expect(handler(event, context)).toBeUndefined();
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await waitFor(event.waitUntil);
    await expect(
      match(createMetaRequest(), {
        cacheName: createMetaCacheName(),
      }),
    ).resolves.toBeInstanceOf(Response);
    await expect(
      getMetaData({
        url: event.request.url,
      }),
    ).resolves.toEqual({
      expires: expect.any(Number),
      random: 'value',
    });
  });

  test('removes metadata for the request and the cached request on expiration', async () => {
    expect.assertions(4);

    const handler = createExpirationMiddleware();
    const event = createFetchEvent('/styles.css');
    const context = { get: jest.fn(() => ({ request: event.request.clone() })) };

    await setMetaData({
      url: event.request.url,
      metadata: {
        expires: 1,
      },
    });

    expect(handler(event, context)).toBeUndefined();
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await waitFor(event.waitUntil);
    expect(deleteMetaData).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(2);
  });
});
