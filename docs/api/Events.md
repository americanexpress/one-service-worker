# Event System

[👈 Go to `README`](../../README.md)

[👆 Back to `API`](./README.md)

## 📖 Table of Contents

- [`Events`](#-events)
  - [`on`](#-on)
  - [`once`](#-once)
  - [`off`](#-off)
  - [`emit`](#-emit)
  - [`emitter`](#-emitter)
- [`Middleware`](#-middleware)
  - [`createMiddleware`](#-createmiddleware)
  - [`createMiddlewareFactory`](#-createmiddlewareFactory)
  - [`createMiddlewareContext`](#-createmiddlewarecontext)

## Events

### `on`

Binds a function callback to the named event.

```js
import { on } from '@americanexpress/one-service-worker';

on('subscribe', console.log);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `eventName` | `String`   | `false`  | Name of an event          |
| `eventFn`   | `Function` | `false`  | Handler for an event      |

**Returns**

`void`

&nbsp;

### `once`

Performs the same functionality as `on` but is removed after the first event is fired.

```js
import { once } from '@americanexpress/one-service-worker';

once('registration', registration => {
  console.log(registration);
});
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `eventName` | `String`   | `false`  | Name of an event          |
| `eventFn`   | `Function` | `false`  | Handler to use once       |

**Returns**

`void`

&nbsp;

### `off`

Removes the event callback for an event.

```js
import { off } from '@americanexpress/one-service-worker';

off('activate', console.log);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `eventName` | `String`   | `false`  | Name of an event          |
| `eventFn`   | `Function` | `false`  | Handler to remove         |

**Returns**

`void`

&nbsp;

### `emit`

Emits a given event name with the event to pass to callbacks.

```js
import { emit } from '@americanexpress/one-service-worker';

const event = {
  data: {
    title,
    options,
  },
};

emit('notification', event);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `eventName` | `String` | `false`  | Name of an event |
| `event`     | `Event`  | `false`  | An event         |

**Returns**

`void`

&nbsp;

### `emitter`

Binds an array of event names to a given target to the event system.

```js
import { emitter } from '@americanexpress/one-service-worker';

emitter(['install', 'activate', 'fetch'], self);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `eventNames` | `[String]` | `false` | Name of an event |
| `event` | `Event` | `false` | An event |

**Returns**

`void`

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)

&nbsp;

## Middleware

### `createMiddleware`

Creates a handler to be bound to event listeners.

```js
import { on, createMiddleware } from '@americanexpress/one-service-worker';

on(
  'fetch',
  createMiddleware(
    [
      function middlewareFunction(event, context) {
        event.respondWith(fetch(context.request));
      },
    ],
    event => ({ request: event.request.clone() }),
  ),
);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `middleware` | `[Function]` | `false` | Array of functions to be used as middleware |
| `getInitialContext` | `Function` | `false` | Function invoked on each event and passed the event object |

**Returns**

`Function`

&nbsp;

### `createMiddlewareFactory`

Creates a factory function that takes in a default array of middleware to be used.

```js
import {
  on,
  createMiddlewareFactory,
} from '@americanexpress/one-service-worker';

const intermediateMiddlewareFactory = createMiddlewareFactory(
  [
    function defaultMiddleware(event, context) {
      console.log(context);
    },
  ],
  event => ({ request: event.request.clone() }),
);

on(
  'fetch',
  intermediateMiddlewareFactory([
    function mainMiddlewareFunction(event, context) {
      event.respondWith(fetch(context.request));
    },
  ]),
);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `defaultMiddleware` | `[Function]` | `false` | Array of functions to be used as middleware |
| `getInitialContext` | `Function` | `false` | Function invoked on each event and passed the event object |

**Returns**

`Function`

&nbsp;

### `createMiddlewareContext`

Constructs a mutable object that serves as a context for an event.

```js
import { createMiddlewareContext } from '@americanexpress/one-service-worker';

createMiddlewareContext({
  constantProperty: 'FYI',
  myMethod() {
    // do something
  },
});
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `initialContext` | `Object` | `false` | Object to initialize the context with |

**Returns**

`Object`

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)