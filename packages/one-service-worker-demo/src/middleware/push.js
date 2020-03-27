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

import fs from 'fs';
import path from 'path';
import url from 'url';
import webPush from 'web-push';

const verbose = true;

// eslint-disable-next-line no-use-before-define
const push = createWebPush();

export function createWebPushConfig({ port = process.env.PORT || 3010, encoding, gcmKey } = {}) {
  const configPath = path.join(__dirname, 'push-config.json');
  let config;

  if (fs.existsSync(configPath)) {
    const json = fs.readFileSync(configPath).toString();
    config = JSON.parse(json);
  } else {
    const keys = webPush.generateVAPIDKeys();
    const mailto = `mailto: push@localhost:${port}`;
    const contentEncoding = encoding || 'aes128gcm';
    const gcmAPIKey = gcmKey || '';

    const vapidDetails = {
      subject: mailto,
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
    };

    config = {
      keys,
      mailto,
      contentEncoding,
      gcmAPIKey,
      vapidDetails,
    };

    fs.writeFileSync(configPath, JSON.stringify(config, undefined, 2));
  }

  return config;
}

export function createWebPush({ port, proxy = '', encoding, gcmKey } = {}) {
  const { keys, mailto, contentEncoding, gcmAPIKey, vapidDetails } = createWebPushConfig({
    port,
    encoding,
    gcmKey,
  });

  if (gcmAPIKey) webPush.setGCMAPIKey(gcmAPIKey);

  const subscriptions = new Map();

  async function sendNotification(subscription, notification) {
    if (subscription) {
      const { title, ...options } = notification;

      if (options.timestamp === undefined) {
        options.timestamp = Date.now();
      }

      const payload = JSON.stringify({
        title,
        options,
      });

      const parsedUrl = url.parse(subscription.endpoint);
      const audience = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

      const headers = webPush.getVapidHeaders(
        audience,
        mailto,
        keys.publicKey,
        keys.privateKey,
        contentEncoding,
      );

      const sendNotificationOptions = {
        gcmAPIKey,
        vapidDetails,
        headers,
        contentEncoding,
        proxy,
      };

      if (verbose) {
        const details = await webPush.generateRequestDetails(
          subscription,
          payload,
          sendNotificationOptions,
        );
        console.log('\nrequest details', details);
      }

      return webPush.sendNotification(subscription, payload, sendNotificationOptions);
    }

    return null;
  }

  return {
    keys,
    mailto,
    contentEncoding,
    gcmAPIKey,
    vapidDetails,
    subscriptions,
    sendNotification,
  };
}

export async function dispatchMiddleware(request, response) {
  response.set({
    'Content-Type': 'text/plain',
  });

  try {
    const { body } = request;

    const { subscription, notification } = body;

    const results = await push.sendNotification(subscription, notification);

    if (verbose) console.log('\npush service response', results);

    response.status(200);
    response.write('OK');
  } catch (error) {
    if (error.statusCode) {
      response.set(error.headers);
      response.status(error.statusCode);
      response.write(error.body);
    } else {
      response.status(500);
      response.write(error.message);
      console.log(error);
    }

    if (verbose) console.log(`\npush service error:`, error);
  }

  response.end();
}

export async function subscriptionMiddleware(request, response) {
  if (request.method === 'GET') {
    if (verbose) console.log(`\nsending application server key:`, push.keys.publicKey);

    response.status(200);
    response.set({
      'Content-Type': 'text/plain',
    });
    response.write(push.keys.publicKey);
  } else {
    const { body: { subscription } = {} } = request;

    if (!subscription) {
      response.status(400);
      response.write('missing subscription');
    } else {
      response.status(202);
      switch (request.method) {
        default:
          break;
        case 'POST': {
          if (verbose) console.log('\nsetting subscription');
          push.subscriptions.set(subscription.endpoint, subscription);
          break;
        }
        case 'DELETE': {
          if (verbose) console.log('\ndeleting subscription');
          push.subscriptions.delete(subscription.endpoint);
          break;
        }
      }
    }
  }

  response.end();
}
