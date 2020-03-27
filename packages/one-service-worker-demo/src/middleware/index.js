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

export { dispatchMiddleware, subscriptionMiddleware } from './push';

export function setHeadersMiddleware(request, response, next) {
  if (request.url.endsWith('.js'))
    response.set({
      'Cache-Scope': 'demo',
    });
  else if (request.accepts('html'))
    response.set({
      'Service-Worker-Navigation-Preload': true,
      Vary: 'Service-Worker-Navigation-Preload',
    });
  return next();
}

export function sendHtmlMiddleware(request, response, next) {
  if (request.url.endsWith('.html')) {
    const unpkg = 'unpkg.com';
    const statics = 'www.aexp-static.com cdaas.americanexpress.com';

    response.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'none';",
        `script-src 'self' ${unpkg} ${statics};`,
        `connect-src 'self' ${unpkg} ${statics};`,
        `img-src 'self' ${statics};`,
        `style-src 'self' ${statics};`,
        `font-src 'self' ${statics};`,
        "manifest-src 'self';",
      ].join(' '),
    );

    response.type('html').sendFile(`${__dirname}/public/index.html`);
  } else next();
}
