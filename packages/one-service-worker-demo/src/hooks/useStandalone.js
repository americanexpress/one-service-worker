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

import { isServiceWorkerSupported, emit } from '@americanexpress/one-service-worker';

export function isStandalone() {
  return (
    // safari:
    window.navigator.standalone === true ||
    // other browsers:
    window.matchMedia('(display-mode: standalone)').matches
  );
}

export function createStandaloneHandlers(setPrompt, setUserChoice) {
  function beforeinstallprompt(event) {
    event.preventDefault();

    emit('beforeinstallprompt', event);

    function installApp() {
      return event.prompt().then(() =>
        event.userChoice.then(choiceResult => {
          if (choiceResult.outcome === 'accepted') setPrompt(null);
          setUserChoice(choiceResult);
          return choiceResult;
        }),
      );
    }

    setPrompt(() => installApp);
  }

  function appinstalled(event) {
    emit('appinstalled', event);

    window.removeEventListener('appinstalled', appinstalled);
    window.removeEventListener('beforeinstallprompt', beforeinstallprompt);
  }

  function bind() {
    window.addEventListener('appinstalled', appinstalled);
    window.addEventListener('beforeinstallprompt', beforeinstallprompt);
    return appinstalled;
  }

  return {
    bind,
    appinstalled,
    beforeinstallprompt,
  };
}

// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen
export default function useStandalone() {
  const [prompt, setPrompt] = React.useState(null);
  const [userChoice, setUserChoice] = React.useState(null);
  const [standalone] = React.useState(() => {
    if (isServiceWorkerSupported()) {
      return isStandalone();
    }
    return false;
  });

  // eslint-disable-next-line consistent-return
  React.useEffect(() => {
    const handles = createStandaloneHandlers(setPrompt, setUserChoice);
    if (!standalone) {
      handles.bind();
    }
    return handles.appinstalled;
  }, [standalone]);

  return {
    standalone,
    userChoice,
    prompt,
  };
}
