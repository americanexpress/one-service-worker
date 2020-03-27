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

export default function ConnectionView() {
  const [connection, setConnection] = React.useState(() =>
    'connection' in navigator ? navigator.connection : null,
  );

  React.useEffect(() => {
    if (connection)
      navigator.connection.addEventListener('change', () => setConnection(navigator.connection));
  }, []);

  return (
    <section>
      <header>
        <span className="icon dls-icon-rewards icon-lg margin-1-b dls-bright-blue" />
        <h2 className="heading-3 dls-gray-05">Connection</h2>
      </header>

      {connection ? (
        <article className="flex flex-column col-md-4 pad-tb text-align-center pad-3-lr border-xs-b stack">
          <p>
            <span>Effective Type </span>
            <span>{connection.effectiveType}</span>
          </p>
          <p>
            <span>RTT </span>
            <span>{connection.rtt}</span>
          </p>

          <div>
            <p>
              <span>Down Link </span>
            </p>
            <span>{connection.downlink}</span>
            <span> megabits per second</span>
          </div>

          <p>
            <span>Save Data </span>
            <span>{connection.saveData}</span>
          </p>
        </article>
      ) : (
        <div>loading</div>
      )}
    </section>
  );
}
