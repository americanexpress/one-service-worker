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
  emit,
  on,
  off,
  once,
  emitter,
  eventListeners,
  calls,
} from '../../../src/utility/events/events';
import { isEventsEnabled } from '../../../src/utility/runtime';

jest.mock('../../../src/utility/errors/errors');
jest.mock('../../../src/utility/runtime/environment');

beforeAll(() => {
  isEventsEnabled.mockImplementation(() => true);

  [
    // eslint-disable-next-line no-restricted-globals
    [self, ['addEventListener']],
    [eventListeners, ['get', 'set', 'has', 'delete']],
    [calls, ['get', 'set', 'has', 'delete']],
  ].forEach(([target, properties]) => properties.forEach(property => jest.spyOn(target, property)));
});

beforeEach(() => {
  jest.clearAllMocks();
  eventListeners.clear();
  calls.clear();
});

describe('disabled', () => {
  const eventName = 'message';
  const fn = jest.fn();

  test('on never adds callback', () => {
    expect.assertions(1);

    isEventsEnabled.mockImplementationOnce(() => false);
    on(eventName, fn);

    expect(eventListeners.size).toBe(0);
  });

  test('off never removes callback', () => {
    expect.assertions(1);

    on(eventName, fn);
    isEventsEnabled.mockImplementationOnce(() => false);
    off(eventName, fn);

    expect(eventListeners.size).toBe(1);
  });

  test('once never adds callback', () => {
    expect.assertions(1);

    isEventsEnabled.mockImplementationOnce(() => false);
    once(eventName, fn);

    expect(eventListeners.size).toBe(0);
  });

  test('emit never fires callback', () => {
    expect.assertions(1);

    on(eventName, fn);
    isEventsEnabled.mockImplementationOnce(() => false);
    emit(eventName, {});

    expect(fn).not.toHaveBeenCalled();
  });

  test('emitter never binds to target events', () => {
    expect.assertions(1);

    isEventsEnabled.mockImplementationOnce(() => false);
    emitter(['onfetch']);

    // eslint-disable-next-line no-restricted-globals
    expect(self.addEventListener).toHaveBeenCalledTimes(0);
  });
});

describe('emit', () => {
  const eventName = 'message';

  test('emit calls event handler for matching event', () => {
    expect.assertions(4);

    const callback = jest.fn();

    eventListeners.set(eventName, new Set([callback]));

    const event = { data: {} };
    const result = emit(eventName, event);
    expect(result).toBeUndefined();
    expect(calls.get).toHaveBeenCalledTimes(1);
    expect(calls.set).toHaveBeenCalledTimes(1);
    expect(eventListeners.get).toHaveBeenCalledTimes(1);
  });

  test('emit only adds the event to calls and does nothing else', () => {
    expect.assertions(2);

    emit(eventName, {
      data: '2',
    });

    expect(eventListeners.get(eventName)).toBeUndefined();
    expect(calls.get(eventName).size).toEqual(1);
  });

  test('emit limits calls stored in memory to three entries by most recent calls', () => {
    expect.assertions(4);

    const callback = jest.fn();

    eventListeners.set(eventName, new Set([callback]));

    const callCount = 8;
    new Array(callCount)
      .fill(0, 0)
      .map((_, i) => ({ data: i }))
      .forEach(event => emit(eventName, event));

    expect(calls.get).toHaveBeenCalledTimes(callCount);
    expect(calls.set).toHaveBeenCalledTimes(callCount);
    expect(eventListeners.get).toHaveBeenCalledTimes(callCount);
    expect(calls.get(eventName).size).toEqual(3);
  });
});

describe('on', () => {
  test('on adds handler to events map', () => {
    expect.assertions(2);

    const eventName = 'message';
    const callback = jest.fn();
    const result = on(eventName, callback);
    expect(result).toBeUndefined();
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test('on adds handler to events map and invokes hanlder with past event calls', () => {
    expect.assertions(2);

    const eventName = 'message';
    const callback = jest.fn();

    calls.set(eventName, new Set([{ data: {} }, { data: 2 }]));

    const result = on(eventName, callback);
    expect(result).toBeUndefined();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('on accepts arrays for the callback', () => {
    expect.assertions(2);

    const eventName = 'message';
    const callback = jest.fn();

    calls.set(eventName, new Set([{ data: {} }, { data: 2 }]));

    const result = on(eventName, [callback]);
    expect(result).toBeUndefined();
    expect(callback).toHaveBeenCalledTimes(2);
  });
});

describe('off', () => {
  test('off does nothing if event is not in events map', () => {
    expect.assertions(3);

    const eventName = 'random-event';
    const callback = jest.fn();
    const result = off(eventName, callback);
    expect(result).toBeUndefined();
    expect(callback).not.toHaveBeenCalled();
    expect(eventListeners.has).toHaveBeenCalledTimes(1);
  });

  test('off removes event handler(s) from events map', () => {
    expect.assertions(6);

    const eventName = 'fetch';
    const callback = jest.fn();
    const secondCallback = jest.fn();

    eventListeners.set(eventName, new Set([callback, callback, callback, secondCallback]));

    const result = off(eventName, callback);
    expect(result).toBeUndefined();
    expect(eventListeners.size).toEqual(1);
    expect(eventListeners.has).toHaveBeenCalledTimes(1);
    expect(eventListeners.get).toHaveBeenCalledTimes(1);
    expect(eventListeners.set).toHaveBeenCalledTimes(2);
    expect(eventListeners.delete).not.toHaveBeenCalled();
  });

  test('off removes event from events map if no handlers exist after removal', () => {
    expect.assertions(6);

    const eventName = 'push';
    const callback = jest.fn();

    eventListeners.set(eventName, new Set([callback]));

    const result = off(eventName, callback);
    expect(result).toBeUndefined();
    expect(eventListeners.size).toEqual(0);
    expect(eventListeners.has).toHaveBeenCalledTimes(1);
    expect(eventListeners.get).toHaveBeenCalledTimes(1);
    expect(eventListeners.delete).toHaveBeenCalledTimes(1);
    expect(eventListeners.set).toHaveBeenCalledTimes(1);
  });
});

describe('once', () => {
  test('once adds event handler to events map', () => {
    expect.assertions(3);

    const eventName = 'fetch';
    const callback = jest.fn();
    const result = once(eventName, callback);
    expect(result).toBeUndefined();
    expect(eventListeners.get(eventName)).toBeDefined();
    expect(eventListeners.get(eventName).size).toEqual(1);
  });

  test('once removes event handler after emit call', () => {
    expect.assertions(6);

    const eventName = 'message';
    const event = { data: {} };
    const callback = jest.fn();
    const result = once(eventName, callback);
    expect(result).toBeUndefined();
    expect(eventListeners.get(eventName)).toBeDefined();
    expect(eventListeners.get(eventName).size).toEqual(1);
    emit(eventName, event);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(event, expect.any(Object));
    expect(eventListeners.get(eventName)).toBeUndefined();
  });
});

describe('emitter', () => {
  test('does nothing if called without arguments', () => {
    expect.assertions(1);

    emitter();

    // eslint-disable-next-line no-restricted-globals
    expect(self.addEventListener).toHaveBeenCalledTimes(0);
  });

  test('adds event listeners to the default target if they are found on the target', () => {
    expect.assertions(1);

    emitter(['onfetch', 'onmessage', 'onunknownevent']);

    // eslint-disable-next-line no-restricted-globals
    expect(self.addEventListener).toHaveBeenCalledTimes(2);
  });

  test('calls the bound event emitter', () => {
    expect.assertions(2);

    emitter(['onfetch']);

    const handler = jest.fn();
    const event = {};
    // eslint-disable-next-line no-restricted-globals
    const listener = self.addEventListener.mock.calls[0][1];
    on('fetch', handler);
    listener(event);

    // eslint-disable-next-line no-restricted-globals
    expect(self.addEventListener).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
