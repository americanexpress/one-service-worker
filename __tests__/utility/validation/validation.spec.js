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

import { OneServiceWorkerError } from '../../../src/utility/errors/errors';
import {
  expectedType,
  expectedArrayOfType,
  enumerableException,
  unknownKey,
  unknownEeventName,
  validateInput,
} from '../../../src/utility/validation/validation';

describe('message generators', () => {
  [expectedType, expectedArrayOfType, enumerableException, unknownKey, unknownEeventName].forEach(
    msgFn => {
      test(`${msgFn.name} - returns string without arguments`, () => {
        expect.assertions(1);

        expect(msgFn()).toEqual(expect.any(OneServiceWorkerError));
      });
    },
  );
});

/* eslint-disable no-console */

describe('validateInput', () => {
  const { warn } = console;

  beforeAll(() => {
    console.warn = jest.fn();
  });
  afterAll(() => {
    console.warn = warn;
  });

  test('should run through all cases of non valid config', () => {
    expect.assertions(14);

    let numberOfCalls = 0;
    const config = {};

    // no keys
    expect(validateInput(config)).toMatchObject([]);
    expect(console.warn).toHaveBeenCalledTimes(numberOfCalls);

    // invalid key
    config.invalidKey = 'wrong-key';
    expect(validateInput(config)).toMatchObject(
      expect.arrayContaining([expect.any(OneServiceWorkerError)]),
    );
    expect(console.warn).toHaveBeenCalledTimes((numberOfCalls += 1));

    // invalid value for partition | also expect invalidKey again
    config.partition = 98;
    expect(validateInput(config)).toMatchObject(
      expect.arrayContaining([expect.any(OneServiceWorkerError)]),
    );
    expect(console.warn).toHaveBeenCalledTimes((numberOfCalls += 2));

    // invalid value for updateViaCache
    delete config.invalidKey;
    config.partition = 'valid-partition-type';
    config.updateViaCache = 'server';
    expect(validateInput(config)).toMatchObject(
      expect.arrayContaining([expect.any(OneServiceWorkerError)]),
    );
    expect(console.warn).toHaveBeenCalledTimes((numberOfCalls += 1));

    // invalid values for offline
    config.updateViaCache = 'all';
    config.offline = {
      path: 89,
      routes: 98,
    };
    expect(validateInput(config)).toMatchObject(
      expect.arrayContaining([expect.any(OneServiceWorkerError)]),
    );
    expect(console.warn).toHaveBeenCalledTimes((numberOfCalls += 1));

    // invalid values for precache
    config.offline = [];
    config.precache = {
      resources: 'nope',
      maxResources: 'nada',
      maxAge: 'nil',
    };
    expect(validateInput(config)).toMatchObject(
      expect.arrayContaining([expect.any(OneServiceWorkerError)]),
    );
    expect(console.warn).toHaveBeenCalledTimes((numberOfCalls += 1));

    console.warn.mockClear();

    // does not log validations
    expect(validateInput(config, false)).toMatchObject(
      expect.arrayContaining([expect.any(OneServiceWorkerError)]),
    );
    expect(console.warn).toHaveBeenCalledTimes(0);

    console.warn = warn;
  });
});
