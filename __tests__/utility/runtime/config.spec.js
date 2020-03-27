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

import { configure, getConfig } from '../../../src/utility/runtime/config';

describe('configuration', () => {
  test('getConfig returns the default configuration', () => {
    expect.assertions(1);

    expect(getConfig()).toEqual({
      development: process.env.NODE_ENV === 'development',
      events: true,
      nonStandard: true,
      navigationPreload: true,
    });
  });

  test('configure changes the properties and getConfig retrieves the updated config', () => {
    expect.assertions(3);

    const currentEvents = getConfig().events;

    expect(configure()).toHaveProperty('events', currentEvents);
    expect(
      configure({
        events: !currentEvents,
      }),
    ).toMatchObject({
      events: !currentEvents,
    });
    expect(getConfig()).toHaveProperty('events', !currentEvents);
  });
});
