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

import { isEventsEnabled } from '../runtime';
import { createMiddlewareContext } from './middleware';

export const eventListeners = new Map();
export const calls = new Map();

export function emit(eventName, event) {
  if (isEventsEnabled()) {
    const listeners = eventListeners.get(eventName) || new Set();
    const callsForEvent = calls.get(eventName) || new Set();

    callsForEvent.add(event);

    // keep no more than three events per type in memory
    if (callsForEvent.size > 2) {
      [...callsForEvent]
        .reverse()
        .filter((_, index) => index > 2)
        .forEach(storedEvent => callsForEvent.delete(storedEvent));
    }

    calls.set(eventName, callsForEvent);

    // error stack tracing in the context
    // which event
    // chain eventing identification
    // log context
    const context = createMiddlewareContext();
    listeners.forEach(listener => listener(event, context));
  }
}

export function on(eventName, callback) {
  if (isEventsEnabled()) {
    if (Array.isArray(callback)) {
      callback.forEach(cb => on(eventName, cb));
    } else {
      const handlers = eventListeners.get(eventName) || new Set();
      handlers.add(callback);
      // calls previous events
      if (calls.has(eventName)) calls.get(eventName).forEach(callback);
      eventListeners.set(eventName, handlers);
    }
  }
}

export function off(eventName, callback) {
  if (isEventsEnabled() && eventListeners.has(eventName)) {
    const handlers = eventListeners.get(eventName);
    handlers.delete(callback);
    if (handlers.size === 0) {
      if (calls.has(eventName)) calls.delete(eventName);
      eventListeners.delete(eventName);
    } else eventListeners.set(eventName, handlers);
  }
}

export function once(eventName, callback) {
  if (isEventsEnabled()) {
    const disposableHandle = (event, context) => {
      off(eventName, disposableHandle);
      callback(event, context);
    };

    on(eventName, disposableHandle);
  }
}

// eslint-disable-next-line no-restricted-globals
export const emitter = (events = [], target = self) =>
  isEventsEnabled() &&
  events.forEach(key => {
    if (key in target && target[key] === null) {
      const eventName = key.replace('on', '');
      // eslint-disable-next-line no-param-reassign
      target.addEventListener(eventName, event => emit(eventName, event));
    }
  });
