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
  getRegistrations,
  postMessage,
  register,
  unregister,
  escapeHatch,
  update,
  on,
  once,
} from '@americanexpress/one-service-worker';

export default function RegistrationView() {
  const [registration, setRegistration] = React.useState(null);
  const [registrations, setRegistrations] = React.useState([]);

  React.useEffect(() => {
    getRegistration().then(setRegistration);
    on('register', reg => {
      console.log(reg);
      setRegistration(reg);
    });
    on('unregister', () => {
      setRegistration(null);
    });
  }, []);

  React.useEffect(() => {
    getRegistrations().then(setRegistrations);

    if (registration) {
      // acknowledgement
      performance.mark('postMessage');
      const correlation = (((Math.random() * 10101010) / 43) % 56.2) * 1000000;
      once('message', event => {
        console.timeEnd('ping pong');
        if (event.data.correlation === correlation) {
          const time = performance.measure('postMessage');
          console.warn('Time taken', time);
        }
      });
      postMessage({
        id: 'ping',
        correlation,
      });
      console.time('ping pong');
    }
  }, [registration]);

  return (
    <article className="pad">
      <header>
        <h2>Service Worker Registration</h2>
      </header>

      <section className="card">
        <header>
          <h3>Registrations</h3>
          <p>
            <span>Total Registrations </span>
            <span>{registrations.length}</span>
          </p>
        </header>

        <ul>
          {React.Children.toArray(
            registrations.map(currentRegistration => (
              <li>
                <section>
                  <header>
                    <h3>Registration</h3>

                    <h4>
                      scope:
                      {currentRegistration.scope}
                    </h4>
                    <p>
                      scriptURL:
                      {(
                        currentRegistration.active ||
                        currentRegistration.waiting ||
                        currentRegistration.installing ||
                        {}
                      ).scriptURL || ''}
                    </p>
                  </header>

                  <button
                    id="update-service-worker"
                    className="btn btn-secondary btn-block"
                    type="button"
                    onClick={() => update()}
                  >
                    Update
                  </button>

                  <footer>
                    <h5>Uninstalling the Service Worker</h5>

                    <button
                      id="unregister-service-worker"
                      className="btn btn-secondary btn-block"
                      type="button"
                      onClick={() => unregister(currentRegistration.scope)}
                    >
                      Unregister
                    </button>
                  </footer>
                </section>
              </li>
            )),
          )}
        </ul>

        {registration ? (
          <footer className="row pad">
            <button
              className="btn btn-secondary btn-block"
              type="button"
              onClick={() => escapeHatch()}
            >
              Escape Hatch
            </button>

            {/* <button
              className="btn btn-secondary btn-block"
              type="button"
              onClick={() => fetch(new Request('/__sw/__escape'))}
            >
              Escape Hatch (via `fetch`)
            </button> */}
          </footer>
        ) : (
          <footer>
            <header>
              <h3>Not Registered</h3>
            </header>

            <button
              id="register-service-worker"
              className="btn btn-secondary btn-block margin-auto-t margin-auto-lr"
              type="button"
              onClick={() => register('/sw.js', { scope: '/' })}
            >
              Register Service Worker
            </button>
          </footer>
        )}
      </section>
    </article>
  );
}
