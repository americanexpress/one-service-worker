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
import { usePermissions } from '../../hooks';

const includePush = false;
const permissionsToCheck = ['notifications'];
if (includePush) permissionsToCheck.push({ name: 'push', userVisibleOnly: true });

export default function PermissionsView() {
  const permissions = usePermissions([['push', { userVisibleOnly: true }], ['notifications']]);

  return (
    <article className="card pad">
      <header>
        <h2 className="heading-3 pad">Permissions</h2>
      </header>

      <ul>
        {React.Children.toArray(
          Object.keys(permissions)
            .filter(permit => typeof permit !== 'function')
            .map(permission => {
              return (
                <li>
                  <p>{permission.name}</p>
                  <p>{permission.current}</p>
                </li>
              );
            }),
        )}
      </ul>
    </article>
  );
}
