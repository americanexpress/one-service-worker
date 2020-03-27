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

import { useInterval } from '../../hooks';

export default function StorageQuotaView() {
  const [storageQuota, setQuote] = React.useState(null);

  const updateQuota = React.useCallback(() => {
    navigator.storage.estimate().then(quote => setQuote(quote));
  });

  useInterval(updateQuota, 1000 * 2);

  return (
    <article>
      <header>
        <span className="icon dls-icon-card-benefit icon-lg margin-1-b dls-bright-blue" />
        <h2 className="heading-3 dls-gray-05">Storage Quota</h2>
      </header>

      {storageQuota ? (
        <React.Fragment>
          <p>
            <span>Quota: </span>
            <span>{storageQuota.quota || 0}</span>
          </p>
          <p>
            <span>Usage: </span>
            <span>{storageQuota.usage / 1000000 || 0}</span>
            <span> mb</span>
          </p>
          <p>
            <span>Percentage: </span>
            <span>{(storageQuota.usage / storageQuota.quota) * 100}</span>
            <span>%</span>
          </p>
        </React.Fragment>
      ) : (
        <p>Loading Storage Info</p>
      )}
    </article>
  );
}
