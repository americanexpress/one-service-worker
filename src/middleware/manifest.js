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

import { isServiceWorker } from '../utility/runtime';

import { matchRequest } from './utility';

export const defaultEndpoint = '/manifest.webmanifest';
export const defaultStartUrl = '/index.html';
export const defaultManifest = {
  name: 'one_service_worker_app',
  short_name: 'app',
  start_url: defaultStartUrl,
};

export const createRequest = ({ route = defaultEndpoint } = {}) => new Request(route);
export const createResponse = ({
  event = { request: createRequest() },
  manifest = defaultManifest,
} = {}) =>
  new Response(JSON.stringify(manifest), {
    url: event.request.url,
    status: 200,
    headers: new Headers({
      'content-type': 'application/json',
    }),
  });

// TODO(DX): validate input, helpful log responses, standalone validator/cli
export default function createManifestMiddleware(manifest, route) {
  if (!isServiceWorker()) return function noop() {};

  const request = createRequest({ route });

  return function manifestMiddleware(event) {
    if (matchRequest({ event, request })) {
      event.respondWith(createResponse({ event, manifest }));
      return true;
    }

    return false;
  };
}
