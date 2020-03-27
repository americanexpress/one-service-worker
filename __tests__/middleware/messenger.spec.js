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

import { createMessageContext, createMessenger } from '../../src/middleware/messenger';
import { createMiddlewareContext } from '../../src/utility/events/middleware';

import { createEvent } from '../helpers';

beforeEach(async () => {
  jest.clearAllMocks();
});

describe('middleware', () => {
  const event = createEvent('message', {
    data: {
      id: 'mock',
    },
  });

  test('middleware can run without arguments', () => {
    const middleware = [createMessageContext(), createMessenger()];

    expect.assertions(middleware.length * 3);

    const context = createMiddlewareContext();

    middleware.forEach(handler => {
      expect(handler).toBeInstanceOf(Function);
      expect(() => handler(event, context)).not.toThrow();
      expect(context.get()).toEqual({
        id: 'mock',
        data: {},
      });
    });
  });
});

describe('createMessageContext', () => {
  test('does nothing without event.data', () => {
    expect.assertions(3);

    const handler = createMessageContext();
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(() => handler({}, context)).not.toThrow();
    expect(context.get()).toEqual({});
  });

  test('does not match default "id"', () => {
    expect.assertions(3);

    const handler = createMessageContext();
    const event = createEvent('message', {
      data: {
        'fake-id': 'mock',
        foo: 'bar',
      },
    });
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(() => handler(event, context)).not.toThrow();
    expect(context.get()).toEqual({});
  });

  test('adds id and data to context', () => {
    expect.assertions(3);

    const handler = createMessageContext();
    const event = createEvent('message', {
      data: {
        id: 'mock',
        foo: 'bar',
      },
    });
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(() => handler(event, context)).not.toThrow();
    expect(context.get()).toEqual({
      id: 'mock',
      data: {
        foo: 'bar',
      },
    });
  });

  test('adds id and data to context from "push" event.data', () => {
    expect.assertions(4);

    const handler = createMessageContext();
    const dataFn = jest.fn(() => ({
      id: 'mock',
      foo: 'bar',
    }));
    const event = createEvent('push');
    event.data = { json: dataFn };
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(() => handler(event, context)).not.toThrow();
    expect(context.get()).toEqual({
      id: 'mock',
      data: {
        foo: 'bar',
      },
    });
    expect(dataFn).toHaveBeenCalledTimes(1);
  });

  test('adds custom id and data to context', () => {
    expect.assertions(3);

    const handler = createMessageContext({
      getID: () => 'custom-id',
    });
    const event = createEvent('message', {
      data: {
        'custom-id': 'mock',
        foo: 'bar',
      },
    });
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(() => handler(event, context)).not.toThrow();
    expect(context.get()).toEqual({
      id: 'mock',
      data: {
        foo: 'bar',
      },
    });
  });

  test('adds custom id and transforms data for context', () => {
    expect.assertions(3);

    const handler = createMessageContext({
      getID: () => 'custom-id',
      transformData: data => ({ ...data, exists: { foo: 'foo' in data } }),
    });
    const event = createEvent('message', {
      data: {
        'custom-id': 'mock',
        foo: 'bar',
      },
    });
    const context = createMiddlewareContext();

    expect(handler).toBeInstanceOf(Function);
    expect(() => handler(event, context)).not.toThrow();
    expect(context.get()).toEqual({
      id: 'mock',
      data: {
        foo: 'bar',
        exists: {
          foo: true,
        },
      },
    });
  });
});

describe('createMessenger', () => {
  test('resolves to a match from the resolvers map and invokes fn', () => {
    expect.assertions(6);

    const resolvers = {
      mock: jest.fn(),
      notCalled: jest.fn(),
    };
    const handler = createMessenger(resolvers);
    const event = createEvent('message');
    const context = createMiddlewareContext({
      id: 'mock',
      data: {
        foo: 'bar',
      },
    });

    expect(handler).toBeInstanceOf(Function);
    expect(() => handler(event, context)).not.toThrow();
    expect(context.get()).toEqual({
      id: 'mock',
      data: {
        foo: 'bar',
      },
    });
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    expect(resolvers.mock).toHaveBeenCalledTimes(1);
    expect(resolvers.notCalled).not.toHaveBeenCalled();
  });
});
