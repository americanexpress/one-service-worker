# React usage

[👈 Go to `README`](../../README.md)

[👆 Back to `Recipes`](./README.md)

It can be beneficial to register a service worker as early as possible during app start.
In this example, we use a functional component to register a service worker and set
the registration to memory. Using context, we can hand our reference of `registration`
instance to the rest of our app.

### `src/app.jsx`

```jsx
import React from 'react';

import { register } from '@americanexpress/one-service-worker';

export const Context = React.createContext();

export default function App() {
  const [registration, setRegistration] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    register({
      scope: '/',
      url: '/sw.js',
    })
      .then(setRegistration)
      .catch(setError);
  }, []);

  return (
    <Context.Provider value={{ registration, error }}>
      {children}
    </Context.Provider>
  );
}
```

[☝️ Return To Top](#-react-usage)