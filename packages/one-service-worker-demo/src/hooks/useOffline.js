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

export function createOfflineEventHandlers(setOffline) {
  return {
    offline() {
      setOffline(true);
    },
    online() {
      setOffline(false);
    },
  };
}

// https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/Online_and_offline_events
export default function useOffline() {
  const [offline, setOffline] = React.useState(false);

  React.useLayoutEffect(() => {
    const handlers = createOfflineEventHandlers(setOffline);

    window.addEventListener('offline', handlers.offline);
    window.addEventListener('online', handlers.online);

    setOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('offline', handlers.offline);
      window.removeEventListener('online', handlers.online);
    };
  }, []);

  return offline;
}
