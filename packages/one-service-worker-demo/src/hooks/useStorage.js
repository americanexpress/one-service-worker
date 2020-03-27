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

export default function useStorage({ session = false, strict = true, onStorage } = {}) {
  const store = React.createRef(() => {
    if (session) store.current = sessionStorage;
    else store.current = localStorage;
  });

  React.useEffect(() => {
    if (session) store.current = sessionStorage;
    else store.current = localStorage;
  }, [session]);

  const api = {
    store,
    get(id) {
      return store.current.getItem(id);
    },
    set(id, value) {
      return store.current.setItem(id, value);
    },
    delete(id) {
      return store.current.removeItem(id);
    },
    clear() {
      return store.current.clear();
    },
    key(index) {
      return store.current.key(index);
    },
    get map() {
      return new Map(this.keys.map(key => localStorage.getItem(key)));
    },
    get keys() {
      return new Array(store.current.length).map((_, i) => localStorage.key(i));
    },
    get values() {
      return new Array(store.current.length).map((_, i) =>
        localStorage.getItem(localStorage.key(i)),
      );
    },
    get length() {
      return store.current.length;
    },
  };

  React.useEffect(() => {
    if (typeof onStorage === 'function') store.current.onstorage = onStorage;
    else store.current.onstorage = null;
  }, [onStorage]);

  React.useEffect(
    () => () => {
      if (session && strict) api.clear();
    },
    [session, strict],
  );

  return api;
}
