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

import React from 'react';

import {
  getSubscription,
  subscribe,
  unsubscribe,
  on,
  off,
} from '@americanexpress/one-service-worker';

export async function getApplicationServerKey() {
  const response = await fetch('/subscribe');
  const applicationServerKey = await response.text();
  return applicationServerKey;
}

export async function postSubscription(subscription) {
  const response = await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      subscription,
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
  return response.status === 202;
}

export async function deleteSubscription(subscription) {
  const response = await fetch('/subscribe', {
    method: 'DELETE',
    body: JSON.stringify({
      subscription,
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
  return response.status === 202;
}

export async function sendNotification(subscription, notification) {
  const response = await fetch('/dispatch', {
    method: 'POST',
    body: JSON.stringify({
      subscription,
      notification,
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
  return response.status === 202;
}

export function createSubscriptionHandlers(setSubscription) {
  return {
    subscribe(subscription) {
      setSubscription(subscription);
    },
    unsubscribe() {
      setSubscription(null);
    },
  };
}

const localStorageKey = 'applicationServerKey';

export default function useWebPush() {
  const [subscription, setSubscription] = React.useState(null);
  const [applicationServerKey, setApplicationServerKey] = React.useState(
    () => localStorage.getItem(localStorageKey) || null,
  );

  React.useEffect(() => {
    if (subscription) {
      postSubscription(subscription);
    }
  }, [subscription]);

  React.useEffect(() => {
    if (applicationServerKey) {
      localStorage.setItem(localStorageKey, applicationServerKey);
    }
  }, [applicationServerKey]);

  React.useEffect(() => {
    if (applicationServerKey === null) getApplicationServerKey().then(setApplicationServerKey);
  }, []);

  React.useLayoutEffect(() => {
    getApplicationServerKey().then(setApplicationServerKey);
    const handlers = createSubscriptionHandlers(setSubscription);
    on('subscribe', handlers.subscribe);
    on('unsubscribe', handlers.unsubscribe);
    getSubscription().then(sub => sub && setSubscription(sub));
    return () => {
      off('subscribe', handlers.subscribe);
      off('unsubscribe', handlers.unsubscribe);
    };
  }, []);

  return {
    applicationServerKey,
    subscription,
    subscribe: () => subscribe({ applicationServerKey }),
    unsubscribe,
    dispatch: notification => sendNotification(subscription, notification),
  };
}
