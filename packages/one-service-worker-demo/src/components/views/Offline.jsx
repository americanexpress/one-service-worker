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

import { useOffline } from '../../hooks';

export default function OfflineView() {
  const offline = useOffline();

  return (
    <article className="flex flex-column col-md-2 pad-tb text-align-center pad-3-lr border-xs-b stack">
      <header>
        <span className="icon dls-icon-hotel icon-lg margin-1-b dls-bright-blue" />
        <h2 className="heading-3 dls-gray-05">Offline Detection</h2>
      </header>

      {offline ? (
        <div>
          <p>Offline</p>
        </div>
      ) : (
        <div>
          <p>OnLine</p>
        </div>
      )}
    </article>
  );
}
