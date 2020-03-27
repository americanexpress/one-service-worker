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

import { OneServiceWorkerError } from '../errors';

export const TYPES = {
  url: 'string',
  path: 'string',
  partition: 'string',
  strategy: 'string',
  shell: 'string',
  scope: 'string',
  cache: 'string',
  cacheName: 'string',
  updateViaCache: 'string',
  offline: 'object',
  precache: 'object',
  maxAge: 'number',
  maxResources: 'number',
  maxContentSize: 'number',
  timeout: 'number',
  strict: 'boolean',
};

export const ENUMS = {
  updateViaCache: ['all', 'imports', 'none'],
};

export const expectedType = ({ key = '', type } = {}) =>
  new OneServiceWorkerError(`Expected ${key} value to be a ${type || TYPES[key]}\n`);
export const expectedArrayOfType = ({ key = '', type = 'string' } = {}) =>
  new OneServiceWorkerError(`Expected value of ${key} to be an Array of ${type}s\n`);
export const enumerableException = ({ key = '' } = {}) =>
  new OneServiceWorkerError(
    `Expected ${key} value to match enumerable values\n\t[${(ENUMS[key] || []).join(', ')}]\n`,
  );
export const unknownKey = ({ key = '', keys = [] } = {}) =>
  new OneServiceWorkerError(
    `Unknown key ${key} given, expected one of:\n\t{ ${keys.join(', ')} }\n`,
  );
export const unknownEeventName = ({ eventName = '', enabledEvents = [] } = {}) =>
  new OneServiceWorkerError(
    [
      `event name "${eventName}" is not a supported event, please select one of the following:\n`,
      `[${enabledEvents.join(',\t')}]`,
    ].join('\n'),
  );

export function validateInput(config, log = true) {
  const exceptions = [];

  const keys = Object.keys(config);

  keys
    .map(key => [key, config[key], typeof config[key]])
    .forEach(([key, value, type]) => {
      if (key in TYPES === false) {
        exceptions.push(
          unknownKey({
            key,
            keys,
          }),
        );
      } else if (type !== TYPES[key]) {
        exceptions.push(
          expectedType({
            key,
          }),
        );
      }

      if (['offline', 'precache'].includes(key)) {
        if (Array.isArray(value) === false) {
          exceptions.push(
            expectedArrayOfType({
              key,
              type: 'string',
            }),
          );
        }
      }

      if (key in ENUMS) {
        if (ENUMS[key].includes(value) === false) {
          exceptions.push(
            enumerableException({
              key,
            }),
          );
        }
      }
    });

  if (log) {
    exceptions.forEach(error => {
      // eslint-disable-next-line no-console
      console.warn(error);
    });
  }

  return exceptions;
}
