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

export class OneServiceWorkerError extends Error {
  constructor(message, error) {
    super(message);

    if (error instanceof Error) {
      this.message = [this.message, error.message].filter(str => !!str).join('::');
      this.stack = error.stack;
    }
  }
}

export const notEnabled = (feature = 'Events', error) =>
  new OneServiceWorkerError(`[${feature} not enabled]`, error);
export const notSupported = (feature = 'Service Worker', error) =>
  new OneServiceWorkerError(`[${feature} not supported]`, error);
export const failedToInstall = (feature = 'Service Worker', error) =>
  new OneServiceWorkerError(`[${feature} failed to install]`, error);
export const failure = (feature = 'Service Worker', error) =>
  new OneServiceWorkerError(`[${feature} failed]`, error);

// handler is used for taking the error and throwing, rejecting or logging
export function errorFactory(fn, handler = n => n) {
  return function callback() {
    return handler(fn());
  };
}
