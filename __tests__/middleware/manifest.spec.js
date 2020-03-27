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

import createManifest, { createResponse } from '../../src/middleware/manifest';
import { createMiddlewareContext } from '../../src/utility/events';
import { isServiceWorker } from '../../src/utility/runtime';

import { createFetchEvent } from '../helpers';

jest.mock('../../src/utility/runtime/environment');

describe('createManifest', () => {
  beforeAll(() => {
    isServiceWorker.mockImplementation(() => true);
  });
  beforeEach(() => jest.clearAllMocks());

  test('does nothing if not in the service worker', async () => {
    expect.assertions(3);

    isServiceWorker.mockImplementationOnce(() => false);

    const route = '/manifest.webmanifest';
    const handler = createManifest();
    const event = createFetchEvent(route);

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event)).toBe(undefined);
    expect(event.respondWith).not.toHaveBeenCalled();
  });

  test('does nothing if route does not match', async () => {
    expect.assertions(3);

    const route = '/manifest.json';
    const handler = createManifest();
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(false);
    expect(event.respondWith).not.toHaveBeenCalled();
  });

  test('responds with default manifest on default path if no arguments set', async () => {
    expect.assertions(4);

    const route = '/manifest.webmanifest';
    const handler = createManifest();
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(true);
    expect(event.respondWith).toHaveBeenCalledTimes(1);
    expect(event.respondWith).toHaveBeenCalledWith(createResponse());
  });

  test('accepts custom manifest and route', async () => {
    expect.assertions(4);

    const route = '/manifest.json';
    const manifest = {
      name: 'one-app-service-worker-app',
    };
    const handler = createManifest(manifest, route);
    const event = createFetchEvent(route);
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(handler(event, context)).toBe(true);
    expect(event.respondWith).toHaveBeenCalledTimes(1);
    expect(event.respondWith).toHaveBeenCalledWith(
      createResponse({
        event,
        manifest,
      }),
    );
  });
});
