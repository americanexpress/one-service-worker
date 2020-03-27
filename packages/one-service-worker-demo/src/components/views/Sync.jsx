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

import { useSync } from '../../hooks';

export default function SyncView() {
  const { tags } = useSync();

  return (
    <article>
      <header>
        <h2>Sync and Background Fetch</h2>
      </header>

      {tags.length > 0 ? (
        <section>
          <header>
            <h3>Current Tags</h3>
          </header>

          <ul>
            {tags.map(tag => (
              <li>{tag}</li>
            ))}
          </ul>
        </section>
      ) : (
        <section>
          <header>
            <h3>No Tags</h3>
          </header>
        </section>
      )}
    </article>
  );
}
