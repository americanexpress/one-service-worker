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
  isPermissionsSupported,
  isNotificationSupported,
} from '@americanexpress/one-service-worker';

import { permissionsReducer, permissionQueryNames, DEFAULT_STATE_KEY } from './ducks/permissions';

export function requestPermission(name) {
  switch (name) {
    default:
      break;
    case 'notifications':
    case 'push':
      if (isNotificationSupported()) {
        return Notification.requestPermission();
      }
  }
  return Promise.resolve();
}

export function permissionsEffect(permissionsToUse = permissionQueryNames, dispatch = () => null) {
  const cleanup = [];

  return () => {
    if (isPermissionsSupported()) {
      permissionsToUse.forEach(permit => {
        const [name, descriptor = {}] = permit;

        navigator.permissions
          .query({
            name,
            ...descriptor,
          })
          .then(permission => {
            dispatch({
              type: permission.state,
              name,
            });

            const update = () => {
              dispatch({
                type: permission.state,
                name,
              });
            };
            permission.addEventListener('change', update);
            cleanup.push(() => permission.removeEventListener('change', update));
          })
          // eslint-disable-next-line no-console
          .catch(error => console.warn(name, error));
      });
    }

    return () => {
      cleanup.forEach(fn => fn());
    };
  };
}

export default function usePermissions(listOfPermissions = permissionQueryNames) {
  const [permissions, dispatch] = React.useReducer(
    permissionsReducer,
    listOfPermissions
      .map(([name]) => ({ [name]: DEFAULT_STATE_KEY }))
      .reduce((state, next) => ({ ...state, ...next }), {}),
  );

  React.useLayoutEffect(permissionsEffect(listOfPermissions, dispatch), []);

  return {
    ...permissions,
    requestPermission,
  };
}
