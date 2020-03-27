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

export const shapes = {
  subscription: {
    endpoint: expect.any(String),
    unsubscribe: expect.any(Function),
  },
  subscriptionOptions: {
    userVisibleOnly: expect.any(Boolean),
    applicationServerKey: expect.any(Uint8Array),
  },
  pushManager: {
    subscribe: expect.any(Function),
    getSubscription: expect.any(Function),
  },
  sync: {
    register: expect.any(Function),
    getTags: expect.any(Function),
  },
  notification: {
    close: expect.any(Function),
  },
  tag: {
    tag: expect.any(String),
    state: expect.any(String),
  },
  registration: {},
  response: {
    headers: expect.any(Headers),
    url: expect.any(String),
    type: expect.any(String),
    statusText: expect.any(String),
    status: expect.any(Number),
    ok: expect.any(Boolean),
  },
};

shapes.subscription.options = shapes.subscriptionOptions;
shapes.registration.pushManager = shapes.pushManager;

export const types = {
  url: expect.any(String),
  scope: expect.any(String),
  registration: expect.objectContaining(shapes.registration),
  subscription: expect.objectContaining(shapes.subscription),
  subscriptionOptions: expect.objectContaining(shapes.subscriptionOptions),
  notification: expect.objectContaining(shapes.notification),
  tag: expect.objectContaining(shapes.tag),
};

export const recordShape = expect.objectContaining({
  url: expect.any(String),
  scope: expect.any(String),
  cache: expect.any(String),
  partitions: expect.arrayContaining([expect.any(String)]),
  precache: expect.any(Boolean),
  offline: expect.any(Boolean),
  expires: expect.any(Number),
  meta: expect.any(Object),
});

export const recordInstancePropertiesShape = expect.objectContaining({
  db: expect.any(Object),
  store: expect.any(Object),
});

export const recordPrototypeMethodsShape = expect.objectContaining({
  findRecord: expect.any(Function),
  getRecord: expect.any(Function),
  setRecord: expect.any(Function),
  updateRecord: expect.any(Function),
  deleteRecord: expect.any(Function),
  resetExpiration: expect.any(Function),
});

export const offlineShape = expect.objectContaining({
  scope: expect.any(String),
  path: expect.any(String),
  routes: expect.arrayContaining([expect.any(String)]),
});

export const configShape = expect.objectContaining({
  partition: expect.any(String),
  scopes: expect.arrayContaining([expect.any(String)]),
  maxAge: expect.any(Number),
  maxResources: expect.any(Number),
  maxContentSize: expect.any(Number),
});

export const configInstancePropertiesShape = expect.objectContaining({
  db: expect.any(Object),
  store: expect.any(Object),
});

export const configPrototypeMethodsShape = expect.objectContaining({
  getConfig: expect.any(Function),
  setConfig: expect.any(Function),
  updateConfig: expect.any(Function),
  deleteConfig: expect.any(Function),
});

export const subscriptionShape = {
  scope: expect.any(String),
  partitions: expect.arrayContaining([expect.any(String)]),
  endpoint: expect.any(String),
  options: expect.objectContaining({
    userVisibleOnly: expect.any(Boolean),
    applicationServerKey: expect.any(Uint8Array),
  }),
};
