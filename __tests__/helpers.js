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

// eslint-disable-next-line import/prefer-default-export
export function createFetchEvent(request = new Request('/index.html')) {
  const event = new global.FetchEvent('fetch', {
    request,
  });
  ['waitUntil', 'respondWith'].forEach(method => {
    event[method] = event[method].bind(event);
    jest.spyOn(event, method);
  });
  return event;
}

export function createEvent(type, parameters) {
  const bindTo = ['waitUntil'];
  let event;
  switch (type) {
    default:
      event = new ExtendableEvent(type, parameters);
      break;
    case 'sync':
      // eslint-disable-next-line no-undef
      event = new SyncEvent(type, parameters);
      break;
    case 'push':
      // eslint-disable-next-line no-undef
      event = new PushEvent(type, parameters);
      break;
    case 'message':
      event = new MessageEvent(type, parameters);
      event.clientId = 'asfjkbakfhbsjdfg';
      break;
    case 'fetch':
      bindTo.push('respondWith');
      event = new FetchEvent(
        type,
        parameters || {
          request: new Request('/index.html'),
        },
      );
      break;
  }
  bindTo.forEach(method => {
    event[method] = event[method].bind(event);
    jest.spyOn(event, method);
  });
  return event;
}

export function printExports(exported, tighten = false) {
  return Object.entries(exported)
    .map(([name, value]) => [name, typeof value].join(' :: '))
    .join(tighten ? ' ' : '\n');
}

export function waitFor(asyncTarget) {
  return Promise.all(asyncTarget.mock.calls.reduce((array, next) => array.concat(next), []));
}
