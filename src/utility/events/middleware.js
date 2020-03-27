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

import { expectedType } from '../validation';

export function checkMiddlewareStack(middlewareStack = []) {
  middlewareStack.forEach(middleware => {
    if (typeof middleware !== 'function') {
      throw expectedType({
        key: 'middleware',
        type: 'function',
      });
    }
  });
  return middlewareStack;
}

export function createMiddlewareContext(defaultContext) {
  const ctx = defaultContext || {};
  const context = {
    get(key) {
      if (key) return ctx[key];
      return ctx;
    },
    set(key, value) {
      ctx[key] = value;
      return ctx;
    },
  };
  return context;
}

export function createMiddleware(middlewares = [], getInitialContext = () => undefined) {
  const middlewareStack = checkMiddlewareStack([].concat(middlewares));

  return function middlewareHandler(event) {
    const stack = [...middlewareStack];

    const context = createMiddlewareContext(getInitialContext(event));

    let result = false;
    while (stack.length > 0) {
      const middleware = stack.shift();
      result = middleware(event, context);
      if (result) break;
    }

    return result;
  };
}

export function createMiddlewareFactory(defaultMiddleware = [], getInitialContext) {
  return function middlewareCreator(middleware = []) {
    return createMiddleware([].concat(defaultMiddleware, middleware), getInitialContext);
  };
}
