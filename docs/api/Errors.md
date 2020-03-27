# Errors

[👈 Go to `README`](../../README.md)

[👆 Back to `API`](./README.md)

## 📖 Table of Contents

- [`OneServiceWorkerError`](#-oneserviceworkererror)
- [`errorFactory`](#-errorfactory)

### `OneServiceWorkerError`

An error class that extends `Error` for the library.

```js
import { OneServiceWorkerError } from '@americanexpress/one-service-worker';

const message = 'something went wrong..';
const existingError = new Error('[native]: DOM error or native API error occurred');
const errorInstance = new OneServiceWorkerError(message, existingError);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `message` | `String` | `false` | A message for the error |
| `error` | `Error` | `false` | An existing error to reference |

&nbsp;

### `errorFactory`

A factory function to construct an error instance and handle the created error.
It can be useful to build synchronous thrown exceptions and asynchronous promise rejections
based on your use case.

```js
import { OneServiceWorkerError, errorFactory } from '@americanexpress/one-service-worker';

const exception = (function createExceptionFn() {
  let promiseMode = false;

  // errorFactory takes two functions
  const exceptionFn = errorFactory(
    // the first constructs the error for a particular exception
    () => new OneServiceWorkerError('doh!'),
    //the second decides to reject with a promise or throw the constructed error
    error => {
      if (promiseMode) {
        return Promise.reject(error);
      }

      throw error;
    },
  );

  return {
    reject() {
      promiseMode = true;
      return exceptionFn();
    },
    throw() {
      promiseMode = false;
      return exceptionFn();
    },
  };
})();

const onError = error => console.log('our error', error);

try {
  exception.throw();
} catch (error) {
  onError(error);
}

exception.reject().catch(onError);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `constructorFn` | `Function` | `false` | Name of an event |
| `handlerFn` | `Function` | `false` | Handler for an event |

**Returns**

`Function`

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)