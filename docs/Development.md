# Developing with the library

[👈 Go to `README`](../README.md)

For those developing in this library, there are several tools to create a richer
DX for users and better explanation of failures during library usage.

## Errors

Errors can be the source of much development pain when using an API. To help alleviate some
of the pain points often associated with ambiguous error messages, it is pivotal to communicate
effectively when creating an error for the library.

### Creating an error

For error reporting in `one-service-worker`, you can create a `OneServiceWorkerError`:

```js
import {
  // our domain
  OneServiceWorkerError,
  // functions that return error
  // with pre-baked message which
  // can take parameters
  notEnabled,
  notSupported,
  failedToInstall,
  failure,
  // helpers
  errorFactory,
} from '@americanexpress/one-service-worker';

// these will create the error
const errorSource = new OneServiceWorkerError('Error');
const createdError = errorFactory(() => errorSource);
```

## Error factory

The error factory creates a function that uses two callbacks to
create the error and handle it.

```js
import {
  notSupported,
  errorFactory,
  getRegistration,
} from '@americanexpress/one-service-worker';

// errorFactory takes two functions
const exception = errorFactory(
  // starting point
  () => notSupported('Service Worker'),
  // instead of throwing, we can reject with a promise
  error => Promise.reject(error),
);

export function getRegistrationPromise() {
  if (isServiceWorkerSupported()) {
    // ... get to work
    return getRegistration();
  }
  // we return our promise rejection on calls to exception
  return exception();
}
```

### Exceptions

Exceptions combine message generator that can be passed arguments, to yield a `OneServiceWorkerError` with the message:

```js
import {
  notEnabled,
  notSupported,
  failedToInstall,
  failure,
} from '@americanexpress/one-service-worker';

[
  notEnabled(),
  notSupported('Permissions'),
  failedToInstall(),
  failure('Registration'),
].map(error => error instanceof OneServiceWorkerError);
```

When combined with `errorFactory`, it can be used to build
reusable error handlers.

```js
import { notEnabled, errorFactory } from '@americanexpress/one-service-worker';
// errorFactory takes two functions
const exception = errorFactory(
  // define the target - an error in this case as input
  () => notEnabled('Events'),
  // and perform on the result of the previous operation
  error => {
    throw error;
  },
);

try {
  exception();
} catch (error) {
  console.error(error);
}
```
