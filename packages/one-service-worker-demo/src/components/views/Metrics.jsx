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

export default function MetricsView() {
  // const [connection, setConnection] = React.useState(() => navigator.connection);

  React.useEffect(() => {
    // navigator.connection.addEventListener('change', () => setConnection(navigator.connection));
  }, []);

  return (
    <article>
      <header className="legal dls-accent-gray-01 dls-accent-gray-01-bg border">
        <span className="icon dls-icon-rewards icon-lg margin-1-b dls-bright-blue" />
        <h2 className="heading-3 dls-gray-05">Metrics</h2>
        <p>first paint</p>
      </header>
    </article>
  );
}
