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

import RegistrationView from './views/Registration';
import CacheView from './views/Cache';
import PerformanceView from './views/Performance';
import StandaloneView from './views/Standalone';
// import PermissionsView from './views/Permissions';
// import SyncView from './views/Sync';
import WebPushView from './views/WebPush';

export default function Client() {
  return (
    <main className="card">
      <header className="flex flex-column card dls-bright-blue-bg dls-white pad margin-b">
        <h1 className="heading-6 text-align-center">One Service Worker Panel</h1>
        <img
          className="card-img-bg card-actionable btn-app-badge-sm width-auto"
          src="/images/one.png"
          alt="one-amex"
        />
      </header>

      <RegistrationView />

      <aside>
        <StandaloneView />
      </aside>

      <PerformanceView />
      <CacheView />

      <section>
        {/* <PermissionsView /> */}
        <WebPushView />
        {/* <SyncView /> */}
      </section>

      <footer>
        <h6 className="heading-2 text-align-center">
          made with
          <span role="img" aria-label="blue-heart">
            💙
          </span>
          at American Express
        </h6>
      </footer>
    </main>
  );
}
