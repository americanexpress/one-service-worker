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

import * as deprecations from '../src/deprecations';
import { printExports } from './helpers';

const { createDeprecationMessage, deprecationNotice, ...deprecatedAPI } = deprecations;

describe('deprecations', () => {
  test('consistently exports API items to be deprecated by next major release', () => {
    expect.assertions(1);
    expect(printExports(deprecatedAPI)).toMatchSnapshot();
  });
});

describe('createDeprecationMessage', () => {
  test('returns string with deprecation message', () => {
    expect.assertions(1);

    expect(createDeprecationMessage()).toEqual(
      '[One Service Worker]: Deprecation Notice - %s is marked for deprecation and will not be accessible in the next major release.',
    );
  });

  test('returns string with deprecation message and extra input message', () => {
    expect.assertions(1);

    const extraInputMessage = 'Use this shiny new API instead.';

    expect(createDeprecationMessage(extraInputMessage)).toEqual(
      [
        '[One Service Worker]: Deprecation Notice - %s is marked for deprecation and will not be accessible in the next major release.',
        extraInputMessage,
      ]
        .join('\n')
        .trim(),
    );
  });
});

describe('deprecationNotice', () => {
  const { warn } = console;

  beforeAll(() => {
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.warn = warn;
  });

  const deprecatedOutput = "I'm deprecated now";
  function deprecatedMember() {
    return deprecatedOutput;
  }

  test('calls the deprecated member and warns about deprecation', () => {
    expect.assertions(3);

    const deprecatedWrapper = deprecationNotice(deprecatedMember);

    expect(deprecatedWrapper()).toEqual(deprecatedOutput);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(createDeprecationMessage(), deprecatedMember.name);
  });
});
