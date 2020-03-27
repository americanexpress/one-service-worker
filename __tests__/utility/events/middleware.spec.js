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
  checkMiddlewareStack,
  createMiddlewareFactory,
  createMiddleware,
  createMiddlewareContext,
} from '../../../src/utility/events/middleware';
import { expectedType } from '../../../src/utility/validation/validation';

jest.mock('../../../src/utility/validation/validation');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('checkMiddlewareStack', () => {
  test('does nothing if no arguments are passed', () => {
    expect.assertions(2);

    expect(checkMiddlewareStack()).toEqual([]);
    expect(expectedType).toHaveBeenCalledTimes(0);
  });

  test('throws if stack contains anything not a function', () => {
    expect.assertions(2);

    const expectedError = expectedType({
      key: 'middleware',
      type: 'function',
    });

    expectedType.mockClear();

    expect(() => checkMiddlewareStack([() => null, null])).toThrow(expectedError);
    expect(expectedType).toHaveBeenCalledTimes(1);
  });
});

describe('createMiddlewareFactory', () => {
  test('returns function', () => {
    expect.assertions(3);

    const middlewareCreator = createMiddlewareFactory();

    expect(middlewareCreator).toBeInstanceOf(Function);

    const middleware = middlewareCreator();

    expect(middleware).toBeInstanceOf(Function);
    expect(middleware()).toBe(false);
  });

  test('runs passed in middleware function', () => {
    expect.assertions(2);

    const defaultMiddleware = jest.fn(() => true);
    const middlewareCreator = createMiddlewareFactory(defaultMiddleware);
    const middleware = middlewareCreator();

    expect(middleware()).toBe(true);
    expect(defaultMiddleware).toHaveBeenCalledTimes(1);
  });
});

describe('createMiddleware', () => {
  test('returns a function', () => {
    expect.assertions(1);

    const handler = createMiddleware();

    expect(handler).toBeInstanceOf(Function);
  });

  test('handles event and runs middleware passed in', () => {
    expect.assertions(2);

    const defaultMiddleware = jest.fn(() => false);
    const handler = createMiddleware(defaultMiddleware);

    expect(handler({})).toBe(false);
    expect(defaultMiddleware).toHaveBeenCalledTimes(1);
  });

  test('stops running middleware stack if middleware returns anything but false', () => {
    expect.assertions(4);

    const middleware1 = jest.fn(() => false);
    const middleware2 = jest.fn(() => true);
    const middleware3 = jest.fn(() => false);
    const handler = createMiddleware([middleware1, middleware2, middleware3]);

    expect(handler({})).toBe(true);
    expect(middleware1).toHaveBeenCalledTimes(1);
    expect(middleware2).toHaveBeenCalledTimes(1);
    expect(middleware3).not.toHaveBeenCalled();
  });
});

describe('createMiddlewareContext', () => {
  test('creates and returns context object', () => {
    expect.assertions(2);

    const context = createMiddlewareContext();

    expect(context).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
    });
    expect(context.get()).toEqual({});
  });

  test('accepts default context as initial value', () => {
    expect.assertions(2);

    const defaultContext = { foo: 'bar' };
    const context = createMiddlewareContext(defaultContext);

    expect(context).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
    });
    expect(context.get()).toEqual(defaultContext);
  });

  test('gets context value by key', () => {
    expect.assertions(2);

    const defaultContext = { foo: 'bar' };
    const context = createMiddlewareContext(defaultContext);

    expect(context).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
    });
    expect(context.get('foo')).toEqual('bar');
  });

  test('updates context by set()', () => {
    expect.assertions(3);

    const context = createMiddlewareContext();

    expect(context).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
    });
    expect(context.get()).toEqual({});

    context.set('foo', 'bar');

    expect(context.get()).toEqual({ foo: 'bar' });
  });
});
