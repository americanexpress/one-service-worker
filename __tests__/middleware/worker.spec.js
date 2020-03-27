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

import { onFetch, onInstall, onActivate, onMessage, onPush, onSync } from '../../src/middleware';
import { isNavigationPreloadEnabled } from '../../src/utility/runtime/environment';

import { createEvent } from '../helpers';

jest.mock('../../src/utility/runtime/environment');

describe('onMessage', () => {
  test('returns handler', () => {
    const handler = onMessage();
    expect(handler).toBeInstanceOf(Function);
  });

  test('responds to event', () => {
    const handler = onMessage();
    const event = createEvent('message', {
      data: {
        partition: 'nav',
        active: true,
      },
    });
    expect(handler(event)).toBe(false);
  });

  test('does not respond to event', () => {
    const handler = onMessage();
    const event = createEvent('message', {
      data: {
        type: 'dismount',
        partition: 'nav',
      },
    });
    expect(handler(event)).toBe(false);
  });
});

describe('onInstall', () => {
  test('returns handler', () => {
    const handler = onInstall();
    expect(handler).toBeInstanceOf(Function);
  });

  test('responds to event', () => {
    const handler = onInstall();
    const event = createEvent();
    expect(handler(event)).toBe(false);
  });

  test('enables navigation preload when on', () => {
    const handler = onInstall();
    const event = createEvent();
    isNavigationPreloadEnabled.mockImplementationOnce(() => true);
    expect(handler(event)).toBe(false);
  });
});

describe('onActivate', () => {
  test('returns handler', () => {
    const handler = onActivate();
    expect(handler).toBeInstanceOf(Function);
  });

  test('responds to event', () => {
    const handler = onActivate();
    const event = createEvent();
    expect(handler(event)).toBe(false);
  });
});

describe('onFetch', () => {
  test('returns handler', () => {
    const handler = onFetch();
    expect(handler).toBeInstanceOf(Function);
  });

  test('responds to event', () => {
    const handler = onFetch();
    const event = createEvent('fetch', {
      request: new Request('/worker.js'),
    });
    expect(handler(event)).toBe(false);
  });
});

describe('onPush', () => {
  test('returns handler', () => {
    const handler = onPush();
    expect(handler).toBeInstanceOf(Function);
  });

  test('responds to event', () => {
    const handler = onPush();
    // eslint-disable-next-line no-undef
    const event = createEvent('push');
    expect(handler(event)).toBe(false);
  });
});

describe('onSync', () => {
  test('returns handler', () => {
    const handler = onSync();
    expect(handler).toBeInstanceOf(Function);
  });

  test('responds to event', () => {
    const handler = onSync();
    // eslint-disable-next-line no-undef
    const event = createEvent('sync');
    expect(handler(event)).toBe(false);
  });
});
