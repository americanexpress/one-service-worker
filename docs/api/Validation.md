# Validation

[👈 Go to `README`](../../README.md)

[👆 Back to `API`](./README.md)

## 📖 Table of Contents

- [`validateInput`](#-validateinput)
- [`getCacheOptions`](#-getcacheoptions)

### `validateInput`

Takes in an object and checks the properties satisfy the `types` schema.

```js
import { validateInput } from '@americanexpress/one-service-worker';

const logErrors = true;

validateInput(
  {
    url: 39,
  },
  logErrors,
);
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `configuration` | `Object` | `false`  | Object to check the properties on |
| `log` | `Boolean` | `false` | Toggles logging the exceptions |

**Returns**

`[ OneServiceWorkerError ]`

&nbsp;

### `getCacheOptions`

Extracts the `cacheOptions` from an object. If no matches, returns `undefined`.

```js
const cacheOptions = {
  ignoreSearch: true,
  ignoreMethod: true,
  ignoreVary: true,
  cacheNam: 'my-cache',
};
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `Object` | `false`  | Object to extract the cacheOptions properties |

**Returns**

`Object|undefined`

&nbsp;

[☝️ Return To Top](#-&#x1F4D6;-table-of-contents)