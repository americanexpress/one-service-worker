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

export function createMessageContext({ getID = () => 'id', transformData = pass => pass } = {}) {
  return function messenger(event, context) {
    if (event.data) {
      const { [getID()]: id, ...data } = 'json' in event.data ? event.data.json() : event.data;

      if (id) {
        context.set('id', id);
        context.set('data', transformData(data, event, context));
      }
    }
  };
}

export function createMessenger(resolvers = {}) {
  return function messenger(event, context) {
    const { id, data } = context.get();

    if (id in resolvers) {
      event.waitUntil(resolvers[id](data, event, context));
    }
  };
}
