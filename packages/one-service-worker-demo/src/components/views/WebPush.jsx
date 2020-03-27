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

import { useWebPush } from '../../hooks';

export const media = {
  logo: {
    href: 'https://americanexpress.io/',
    src: '/images/one.png',
    alt: 'One Amex',
  },
  default: {
    src: '/images/one.png',
    alt: 'One Amex',
  },
  survey: {
    src: '/images/one.png',
    alt: 'Question Blurb',
  },
  inbox: {
    src: '/images/one.png',
    alt: 'Inbox',
  },
  cake: {
    src: '/images/one.png',
    alt: 'Cake Slice',
  },
  ring: {
    src: '/audio/gong.m4a',
    alt: 'Gong',
  },
};

const pushNotificationSamples = [
  {
    id: 'Survey',
    title: 'One Question Survey',
    body: 'Do you like progressive web apps?',
    icon: media.survey.src,
    vibrate: [200, 200, 200, 200],
    actions: [
      {
        action: 'yes',
        title: 'Yes',
        icon: media.default.src,
      },
      {
        action: 'eh',
        title: '¯\\_(ツ)_/¯',
        icon: media.default.src,
      },
      {
        action: 'huh',
        title: 'What?',
        icon: media.default.src,
      },
      {
        action: 'no',
        title: 'No',
        icon: media.default.src,
      },
    ],
  },
  {
    id: 'Inbox',
    title: 'Inbox - New Messages (58)',
    body: 'Dan has sent you a direct message',
    icon: media.inbox.src,
    vibrate: [150, 180, 120],
    sound: media.ring.src,
  },
  {
    id: 'Feature',
    title: 'Cake Shop | New Feature',
    body: "We've made a new way to add cake recipes!",
    icon: media.cake.src,
    vibrate: [50, 240],
    sound: media.ring.src,
  },
];

export default function WebPushView() {
  const { subscription, subscribe, dispatch } = useWebPush();

  return (
    <article className="pad">
      <header>
        <h2>Web Push Subscription</h2>
      </header>

      {subscription ? (
        <section>
          <header>
            <h3>Current Subscription</h3>
          </header>

          <p>{subscription.endpoint}</p>

          <footer>
            <h4>Try The Sample Notifications</h4>

            {React.Children.toArray(
              pushNotificationSamples.map(({ id, ...sample }) => (
                <li>
                  <button
                    id={`push-notification-${id.toLocaleLowerCase()}`}
                    type="button"
                    onClick={() => dispatch(sample)}
                  >
                    {id}
                  </button>
                </li>
              )),
            )}
          </footer>
        </section>
      ) : (
        <section>
          <header>
            <h3>No Subscription</h3>
          </header>

          <button
            id="push-subscribe"
            className="btn btn-secondary"
            type="button"
            onClick={() => subscribe()}
          >
            Subscribe
          </button>
        </section>
      )}
    </article>
  );
}
