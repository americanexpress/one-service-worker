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
import { clear, addAll, entries } from '@americanexpress/one-service-worker';

import { useInterval } from '../../hooks';

export function getResourcesByDuration(resources) {
  return resources.sort((a, b) => b.duration - a.duration);
}

export default function CacheView() {
  const [cacheStateMap, setCacheMap] = React.useState([]);

  React.useEffect(() => {
    const requestsToCache = ['/manifest.webmanifest'];

    addAll(requestsToCache);
  }, []);

  const [resources, setResources] = React.useState(performance.getEntriesByType('resource'));
  const [, setOrigins] = React.useState(new Map());

  React.useEffect(() => {
    if (resources) {
      setOrigins(
        resources.reduce((map, { name, duration, nextHopProtocol, initiatorType, ...rest }) => {
          const url = new URL(name);

          const seconds = duration > 1000;
          const route = {
            name: url.pathname,
            duration,
            nextHopProtocol,
            initiatorType,
            seconds,
            ...rest,
          };

          if (map.has(url.origin)) {
            const origin = map.get(url.origin);

            origin.routes.push(route);

            map.set(url.origin, origin);
          } else {
            map.set(url.origin, {
              name: url.origin,
              routes: [route],
            });
          }
          return map;
        }, new Map()),
      );
    }
  }, [resources]);

  useInterval(() => {
    // console.log(cacheMap, origins, resources);
    setResources(performance.getEntriesByType('resource'));
    entries().then(cacheState => setCacheMap(cacheState));
  }, 1000 * 2);

  return (
    <article className="pad">
      <header>
        <h2>Cache</h2>

        <section>
          <header>
            <h3>Admin</h3>
          </header>

          <button
            id="clear-cache"
            className="btn btn-secondary"
            type="button"
            onClick={() => clear()}
          >
            Clear Cache
          </button>
        </section>
      </header>

      <section>
        <header>
          <h3>Inventory</h3>
        </header>

        {React.Children.toArray(
          cacheStateMap.map(([cacheRequests, cache, cacheName]) => (
            <ul>
              <section>
                <header>
                  <h4>{cacheName}</h4>
                </header>

                <ul>
                  {React.Children.toArray(
                    cacheRequests.map(({ url, nextHopProtocol, initiatorType }) => (
                      <li className="pad">
                        <article>
                          <header className="row pad">
                            <h5 className="header-3">{url}</h5>
                          </header>

                          <div className="row flex flex-row">
                            <p>
                              <span>Initiator </span>
                              <span>{initiatorType}</span>
                            </p>
                            <p>
                              <span>HTTP Version </span>
                              <span>{nextHopProtocol === 'h2' ? '2' : '1'}</span>
                            </p>
                          </div>

                          <footer>
                            <button
                              className="cache-delete-button btn btn-secondary"
                              type="button"
                              onClick={() => cache.add(url)}
                              // onClick={() => add(url) || cache.add(url)}
                            >
                              Add
                            </button>
                            <button
                              className="cache-delete-button btn btn-secondary"
                              type="button"
                              onClick={() => cache.delete(url)}
                              // onClick={() => remove(url) || cache.delete(url)}
                            >
                              Delete
                            </button>
                          </footer>
                        </article>
                      </li>
                    )),
                  )}
                </ul>
              </section>
            </ul>
          )),
        )}
      </section>
    </article>
  );
}
