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

const initialNotificationState = {
  title: '',
  body: '',
  icon: '',
  image: '',
  badge: '',
  sound: '',
  dir: 'ltr',
  lang: 'en-US',
  renotify: false,
  requireInteraction: false,
  vibrate: [200],
  actions: [],
};

function notificationReducer(state = {}, action) {
  switch (action.type) {
    case 'reset':
      return initialNotificationState;
    case 'add-vibrate-pattern':
      return {
        ...state,
        vibrate: state.vibrate.concat(parseInt(action.vibration, 10)),
      };
    case 'remove-vibrate-pattern':
      return {
        ...state,
        vibrate: state.vibrate.filter((_, index) => index !== action.index),
      };
    default: {
      if (action.type in state) {
        return {
          ...state,
          [action.type]: action.value,
        };
      }

      return state;
    }
  }
}

export default function NotificationComposer(defaults) {
  const [vibration, setVibration] = React.useState('100');
  const [state, dispatch] = React.useReducer(notificationReducer, {
    ...initialNotificationState,
    ...defaults,
  });

  return {
    state,
    dispatch,
    get vibration() {
      return vibration;
    },
    set vibration(vibrate) {
      setVibration(vibrate);
      return vibrate;
    },
  };
}
