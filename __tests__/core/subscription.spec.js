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

import webPush from 'web-push';

import {
  applicationServerKeyToBase64Array,
  urlBase64ToUint8Array,
} from '../../src/core/subscription';

describe('subscription', () => {
  const VAPIDKeys = webPush.generateVAPIDKeys();
  const applicationServerKey = VAPIDKeys.publicKey;

  describe('applicationServerKeyToBase64Array', () => {
    const vapidPublicKeySample =
      'BEfNAnDvbFoCE1c2ntkuu2_L6KjQr9WbD3KYkq8AIPkdBaFguYx6xgL845CjI8F4PbejwxJ-fHxfrUcLMYlCQZk';

    test('transforms vapid public key to an array of char codes', () => {
      const sample = applicationServerKeyToBase64Array(vapidPublicKeySample);
      // jest/no-large-snapshots...
      expect(JSON.stringify(sample)).toMatchSnapshot();
      expect(sample).toMatchObject(expect.arrayContaining([expect.any(Number)]));
    });
  });

  test('urlBase64ToUint8Array returns Uint8Array', () => {
    expect.assertions(2);

    const typedArray = urlBase64ToUint8Array();
    expect(typedArray).toEqual(expect.any(Uint8Array));
    expect(typedArray.length).toEqual(0);
  });

  test('urlBase64ToUint8Array returns Uint8Array of applicationServerKey', () => {
    expect.assertions(1);

    const typedArray = urlBase64ToUint8Array(applicationServerKey);
    // include padding (=...)
    expect(typedArray.length).toEqual(applicationServerKey.length + 1);
  });
});
