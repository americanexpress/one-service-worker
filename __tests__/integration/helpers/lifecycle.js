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

import {
  serverAddress,
  registerServiceWorkerSelector,
  unregisterServiceWorkerSelector,
} from './constants';
import { createBrowser } from './platform';
import { sleep } from './utility';

// eslint-disable-next-line import/prefer-default-export
export function createServiceWorkerLifecycleTest(platform) {
  let browser = null;
  beforeAll(async () => {
    jest.setTimeout(15e3);
    browser = await createBrowser(platform);
  });
  afterAll(async () => {
    await browser.close();
  });

  describe(`${platform} - 'register/unregister'`, () => {
    let context = null;

    beforeAll(async () => {
      context = await browser.newContext();
    });
    afterAll(async () => {
      await context.close();
    });

    test('opens client demo app and registers service worker successfully', async () => {
      const page = await context.newPage();
      await page.goto(serverAddress, {
        waitUntil: 'load',
      });

      await expect(page.evaluate(() => 'serviceWorker' in navigator)).resolves.toBe(true);
      await expect(
        page.evaluate(() => navigator.serviceWorker.getRegistration()),
      ).resolves.toBeUndefined();

      const registerBtn = await page.$(registerServiceWorkerSelector);
      await registerBtn.click();

      await sleep(500);

      await expect(
        page.evaluate(() =>
          navigator.serviceWorker.ready.then(registration =>
            JSON.stringify({
              scope: registration.scope,
              installing: registration.installing !== null,
              waiting: registration.waiting !== null,
              activating: registration.activating !== null,
              controller: navigator.serviceWorker.controller !== null,
              scriptURL: navigator.serviceWorker.controller
                ? navigator.serviceWorker.controller.scriptURL
                : 'undefined',
            }),
          ),
        ),
      ).resolves.toEqual(
        JSON.stringify({
          scope: `${serverAddress}`,
          installing: false,
          waiting: false,
          activating: true,
          controller: true,
          scriptURL: `${serverAddress}sw.js`,
        }),
      );

      if (platform === 'chromium') {
        const targets = (await browser.targets()).map(t => t.type());
        expect(targets.includes('service_worker')).toBe(true);
        const swTarget = await browser.waitForTarget(target => target.type() === 'service_worker');
        const worker = await browser.serviceWorker(swTarget);
        // eslint-disable-next-line no-restricted-globals
        expect(await worker.evaluate(() => self.toString())).toBe(
          '[object ServiceWorkerGlobalScope]',
        );
      }
    });

    test('opens client demo app and unregisters existing service worker successfully', async () => {
      const page = await context.newPage();
      await page.goto(serverAddress, {
        waitUntil: 'load',
      });
      await page.evaluate(() => navigator.serviceWorker.ready);

      await expect(
        page.evaluate(() =>
          navigator.serviceWorker.ready.then(registration => registration.toString()),
        ),
      ).resolves.toEqual('[object ServiceWorkerRegistration]');

      const unregisterBtn = await page.$(unregisterServiceWorkerSelector);
      await unregisterBtn.click();

      await sleep(250);

      await expect(
        page.evaluate(() => navigator.serviceWorker.getRegistration()),
      ).resolves.toBeUndefined();
    });
  });

  describe(`${platform} - 'escapeHatch'`, () => {
    let context = null;

    beforeAll(async () => {
      context = await browser.newContext();
    });
    afterAll(async () => {
      await context.close();
    });

    test('registers three service workers on different scopes and removes them all with escapeHatch', async () => {
      expect.assertions(4);

      const page = await context.newPage();
      await page.goto(serverAddress, {
        waitUntil: 'load',
      });
      // minified library
      await page.addScriptTag({
        path: `${process.cwd()}/index.min.js`,
      });
      // page level script
      await page.addScriptTag({
        content: `
        async function registerThreeServiceWorkers() {
          const a = await window.oneServiceWorker.register('/sw.js', {
            scope: '/'
          });
          const b = await window.oneServiceWorker.register('/sw.js', {
            scope: '/articles'
          });
          const c = await window.oneServiceWorker.register('/sw.js', {
            scope: '/data'
          });

          return [a,b,c];
        }

        async function removeThreeServiceWorkers() {
          const result = await window.oneServiceWorker.escapeHatch();
          return result;
        }
        `,
      });

      // adding three service worker registrations
      await expect(
        page.evaluate(`(async () => await registerThreeServiceWorkers())()`),
      ).resolves.toHaveLength(3);
      await expect(
        page.evaluate(() => navigator.serviceWorker.getRegistrations()),
      ).resolves.toHaveLength(3);

      // removing the registrations with escapeHatch
      await expect(
        page.evaluate(`(async () => await removeThreeServiceWorkers())()`),
      ).resolves.toHaveLength(3);
      await expect(
        page.evaluate(() => navigator.serviceWorker.getRegistrations()),
      ).resolves.toHaveLength(0);
    });
  });
}
