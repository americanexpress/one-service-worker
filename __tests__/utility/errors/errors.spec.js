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
  OneServiceWorkerError,
  errorFactory,
  notEnabled,
  notSupported,
  failedToInstall,
  failure,
} from '../../../src/utility/errors/errors';

describe('OneServiceWorkerError', () => {
  expect.assertions(1);

  test('returns error', () => {
    expect(new OneServiceWorkerError()).toBeInstanceOf(Error);
  });

  test('returns error with message', () => {
    expect.assertions(2);

    const error = new OneServiceWorkerError('broken');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toEqual('broken');
  });

  test('adds error stack if error is passed to constructor', () => {
    expect.assertions(3);

    const typeError = new TypeError();
    const error = new OneServiceWorkerError('broken', typeError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toEqual('broken');
    expect(error.stack).toBeDefined();
  });
});

describe('errorFactory', () => {
  test('returns null on invoction', () => {
    expect.assertions(1);

    const exception = errorFactory(() => null);
    expect(exception()).toBe(null);
  });

  test('errorFactory throws error on invocation', () => {
    expect.assertions(1);

    const exception = errorFactory(
      () => notEnabled('Events'),
      error => {
        throw error;
      },
    );
    expect(() => exception()).toThrow();
  });

  test('errorFactory rejects error error on invocation', () => {
    expect.assertions(1);

    const exception = errorFactory(
      () => notSupported('Sync'),
      error => Promise.reject(error),
    );
    expect(exception()).rejects.toBeInstanceOf(OneServiceWorkerError);
  });
});

describe('message generators', () => {
  [notEnabled, notSupported, failedToInstall, failure].forEach(msgFn => {
    test(`${msgFn.name} - returns string without arguments`, () => {
      expect.assertions(1);

      expect(msgFn()).toEqual(expect.any(OneServiceWorkerError));
    });
  });
});
