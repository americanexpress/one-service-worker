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

export function applicationServerKeyToBase64Array(applicationServerKey) {
  // the applicationServerKey is the public key used in web push and creating a subscription
  // Transform the applicationServerKey string to base64
  // Clean the string and generate the padding:
  const string = applicationServerKey.replace(/"/g, '');
  const padding = '='.repeat((4 - (string.length % 4)) % 4);
  const base = `${string}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  // Encode it to base64, if not already:
  // eslint-disable-next-line no-restricted-globals
  const base64 = self.atob(base);
  // get character codes for passing into typed arrays:
  return base64.split('').map(char => char.charCodeAt(0));
}

// See: https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe#Syntax
export function urlBase64ToUint8Array(applicationServerKey) {
  if (applicationServerKey) {
    return new Uint8Array(applicationServerKeyToBase64Array(applicationServerKey));
  }
  return new Uint8Array(0);
}
