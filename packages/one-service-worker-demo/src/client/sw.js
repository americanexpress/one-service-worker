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

/* eslint-disable no-restricted-globals */

import {
  configure,
  on,
  postMessage,
  showNotification,
  onMessage,
  skipWaiting,
  clientsClaim,
  cacheRouter,
  escapeHatchRoute,
  // navigationPreload,
  // navigationPreloadResponse,
  // manifest,
  // messageContext,
  // messenger,
  precache,
  appShell,
  expiration,
} from '@americanexpress/one-service-worker';

import config from './config';

configure(config);

self.addEventListener(
  'message',
  onMessage([
    event => {
      console.log('sw - on message data (service worker): ', event.data);
    },
    // eslint-disable-next-line consistent-return
    event => {
      if (event.data.id === 'ping') {
        console.log('sw - correlation: ', event.data.correlation);
        event.waitUntil(
          postMessage(
            {
              id: 'pong',
              correlation: event.data.correlation,
            },
            event.source,
          ),
        );
        return true;
      }
    },
  ]),
);

on('install', [
  skipWaiting(),
  precache(['/images/one.png', '/audio/gong.m4a'], {
    cacheName: 'pre-cache',
  }),
]);

on('activate', [clientsClaim()]);

on('fetch', [
  escapeHatchRoute(),
  appShell({
    route: '/index.html',
  }),
  cacheRouter({
    matcher: event => /@americanexpress/.test(event.request.url),
  }),
  cacheRouter({
    cacheName: 'unpkg-cache',
    matcher: event => /unpkg\.com/.test(event.request.url),
  }),
  cacheRouter({
    cacheName: 'example-scripts-cache',
    matcher: event => /(scripts.*\.js$)/.test(event.request.url),
  }),
  cacheRouter({
    cacheName: 'example-static-cache',
    matcher: event => /(static|dls).*\.(js|css|svg|png|ttf|woff)$/.test(event.request.url),
  }),
  expiration(),
]);

on('push', [
  event => {
    const { title, options } = event.data.json();
    event.waitUntil(showNotification(title, options));
    return true;
  },
]);
