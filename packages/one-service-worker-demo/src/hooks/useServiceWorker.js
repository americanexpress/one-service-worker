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
  getRegistration,
  register,
  unregister,
  escapeHatch,
  on,
} from '@americanexpress/one-service-worker';

export default function useServiceWorker({
  active = false,
  disabled = false,
  activateEscapeHatch = false,
  url = '/service-worker.js',
  scope = '/',
  updateViaCache = 'none',
} = {}) {
  const [registration, setRegistration] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    on('register', setRegistration);
    getRegistration().then(setRegistration);
  }, []);

  React.useEffect(() => {
    if (!mounted) {
      if (disabled) {
        unregister()
          .catch(setError)
          .then(() => setMounted(true));
      } else if (activateEscapeHatch) {
        escapeHatch()
          .catch(setError)
          .then(() => setMounted(true));
      } else if (active && registration === null) {
        register(url, {
          scope,
          updateViaCache,
        })
          .catch(setError)
          .then(
            successfulRegistration =>
              successfulRegistration && setRegistration(successfulRegistration),
          )
          .then(() => setMounted(true));
      } else setMounted(true);
    }
  }, [registration, active, disabled, activateEscapeHatch, mounted]);

  React.useEffect(() => {
    on('register', currentRegistration => setRegistration(currentRegistration));
  }, []);

  return { registration, error };
}
