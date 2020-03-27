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

/* eslint-disable no-underscore-dangle, global-require, import/no-extraneous-dependencies, max-classes-per-file */
// eslint-disable-next-line import/no-extraneous-dependencies
const NodeEnvironment = require('jest-environment-node');

const defaultLocation = 'https://my-progressive-web-app.example.com';

module.exports = class ServiceWorkerEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    this.testPath = context.testPath;
    this.options = config.testEnvironmentOptions || { env: 'shared' };
  }

  async setup() {
    await super.setup();

    Object.assign(this.global.process.env, this.options.env);

    let target;

    switch (this.options.target) {
      default:
      case 'shared':
        target = this.makeSharedContext(this.options);
        break;
      case 'client':
        target = this.createBrowserContext(this.options);
        break;
      case 'service-worker':
        target = this.createServiceWorkerContext(this.options);
        break;
    }

    Object.assign(this.global, target, {
      options: this.options,
      helpers: {
        // for event.waitUntil and event.respondWith, resolves the promises they contain
        waitFor: asyncTarget =>
          Promise.all(asyncTarget.mock.calls.reduce((array, next) => array.concat(next), [])),
        sleep: timeToSleep => new Promise(resolve => setTimeout(resolve, timeToSleep)),
      },
    });

    // consequently from importing `serivce-worker-mock` outside of vm execution.
    // required by the globals used from within the package
    // #6002 - https://github.com/facebook/jest/issues/6002
    // #3703 - https://github.com/facebook/jest/issues/3703
    // #4385 - https://github.com/facebook/jest/issues/4358
    const { self, fetch, Request, Response, Blob } = target;
    Object.assign(global, { self, fetch, Request, Response, Blob });
  }

  async teardown() {
    await super.teardown();

    // clean-up runtime globals
    delete global.self;
    delete global.fetch;
    delete global.Request;
    delete global.Response;
    delete global.Blob;
  }

  runScript(script) {
    // vm.Script - https://nodejs.org/api/vm.html#vm_class_vm_script
    if (this.context) {
      return script.runInContext(this.context);
    }

    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  makeSharedContext({ locationUrl = defaultLocation, sync = true } = {}) {
    const makeServiceWorkerEnv = require('service-worker-mock');

    const shared = makeServiceWorkerEnv({ locationUrl });

    // bug where match & matchAll reuses internal testing cache, resulting in body used error
    const { match, matchAll } = shared.Cache.prototype;
    shared.Cache.prototype.match = function matchCorrected(...args) {
      return match.call(this, ...args).then(result => (result && result.clone()) || null);
    };
    shared.Cache.prototype.matchAll = function matchAllCorrected(...args) {
      return matchAll
        .call(this, ...args)
        .then(results => (results && results.map(result => result.clone())) || []);
    };

    if (sync) {
      class SyncEvent extends shared.ExtendableEvent {
        constructor(tag) {
          super('sync');
          this.tag = tag;
          this.lastChance = false;
        }
      }
      class SyncRegistration {
        constructor(tag) {
          this.tag = tag;
          this.state = 'pending';
        }
      }
      class SyncManager {
        constructor() {
          this._tags = new Set();
        }

        register(tag) {
          if (this._tags.has(tag) === false) this._tags.add(new SyncRegistration(tag));
          return Promise.resolve();
        }

        getTags() {
          return Promise.resolve([...this._tags.values()]);
        }
      }

      Object.assign(shared, { SyncEvent, SyncManager, SyncRegistration });

      shared.registration.sync = new SyncManager();
    } else {
      delete shared.SyncEvent;
      delete shared.SyncManager;
      delete shared.SyncRegistration;
    }

    // corrections
    shared.registration.scope = new shared.URL(
      shared.registration.scope,
      shared.location.origin,
    ).href;

    // events
    shared.self.oninstall = null;
    shared.self.onactivate = null;
    shared.self.onfetch = null;
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    shared.self.onmessage = null;
    shared.self.onpush = null;
    shared.self.onpushsubscriptionchange = null;
    shared.self.onnotificationclick = null;
    shared.self.onnotificationclose = null;

    return Object.assign(shared, {
      atob: function atob(encoded) {
        return encoded;
      },
      btoa: function btoa(decoded) {
        return decoded;
      },
      // eslint-disable-next-line max-params
      createImageBitmap: function createImageBitmap(img, sx, sy, sw, sh) {
        const imgBitmap = {
          width: sw - sx,
          height: sh - sy,
        };
        return Promise.resolve(imgBitmap);
      },
      fetch: function fetch(request = new Request(new URL('/')), options, response) {
        const { url } = request;

        const options_ = { url };

        return Promise.resolve(
          response instanceof Response ? response : new Response(null, options_),
        );
      },
    });
  }

  createServiceWorkerContext({ locationUrl = defaultLocation, idb = true, sync = true } = {}) {
    return this.makeSharedContext({ locationUrl, idb, sync });
  }

  createBrowserContext({
    locationUrl = defaultLocation,
    worker = true,
    idb = true,
    sync = true,
  } = {}) {
    const shared = this.makeSharedContext({
      locationUrl,
      idb,
      sync,
    });

    const { registration } = shared;

    let serviceWorker;

    class EventTarget {
      constructor() {
        this._listeners = {};
      }

      removeEventListener(name, callback) {
        if (name in this._listeners) this._listeners[name].delete(callback);
      }

      addEventListener(name, callback) {
        if (name in this._listeners) this._listeners[name].add(callback);
        else this._listeners[name] = new Set([callback]);
      }

      dispatchEvent(name, event_ = null) {
        if (typeof name === 'string' && name in this._listeners) {
          const event = {
            target: this,
          };

          Object.assign(event, event_);

          this._listeners[name].forEach(callback => callback(event));
        }
      }
    }

    if (worker) {
      class Worker extends EventTarget {
        // eslint-disable-next-line class-methods-use-this
        postMessage() {}
      }

      class ServiceWorker extends Worker {
        constructor() {
          super();

          // eslint-disable-next-line unicorn/prefer-add-event-listener
          this.onerror = null;
          this.onstatechange = null;
          this.onupdatefound = null;
        }
      }

      class ServiceWorkerContainer {
        constructor() {
          this._registration = registration;
          this._controller = new ServiceWorker();
        }

        register(url, { scope }) {
          registration.scope = new shared.URL(scope, shared.location.origin).href;

          this._setState('installing');

          return Promise.resolve(registration);
        }

        getRegistration() {
          return Promise.resolve(this._registration);
        }

        getRegistrations() {
          return Promise.resolve([this._registration]);
        }

        get ready() {
          return Promise.resolve(this._registration);
        }

        get controller() {
          if (this._active) {
            return this._controller;
          }

          return undefined;
        }

        _setState(state) {
          switch (state) {
            default:
              registration.installing = null;
              registration.waiting = null;
              registration.active = null;
              this._active = false;
              break;
            case 'installing':
              registration.installing = this._controller;
              registration.waiting = null;
              registration.active = null;
              this.waiting = null;
              this._active = false;
              this._controller.dispatchEvent('statechange', { target: { state: 'installing' } });
              break;
            case 'waiting':
              registration.installing = null;
              registration.waiting = this._controller;
              registration.active = null;
              this._active = false;
              this._controller.dispatchEvent('statechange', { target: { state: 'installed' } });
              this._controller.dispatchEvent('statechange', { target: { state: 'activating' } });
              break;
            case 'active':
              registration.installing = null;
              registration.waiting = null;
              registration.active = this._controller;
              this._active = true;
              this._controller.dispatchEvent('statechange', { target: { state: 'activated' } });
              break;
          }
        }
      }

      serviceWorker = new ServiceWorkerContainer();

      Object.assign(shared, {
        Worker,
        ServiceWorker,
        ServiceWorkerContainer,
      });
    }

    class Navigator {
      constructor() {
        this._setCurrentState = this._setCurrentState.bind(this);
        this._enableServiceWorker = this._enableServiceWorker.bind(this);
        this._disableServiceWorker = this._disableServiceWorker.bind(this);
      }

      _setCurrentState(state) {
        this._serviceWorker._setState(state);
      }

      _enableServiceWorker() {
        this.serviceWorker = serviceWorker;
        this._serviceWorkerEnabled = true;
      }

      _disableServiceWorker() {
        delete this.serviceWorker;
        this._serviceWorkerEnabled = false;
      }
    }

    class Window extends EventTarget {
      constructor() {
        super();

        Object.assign(this, shared, {
          EventTarget,
          Navigator,
          Window,
        });

        this.navigator = new Navigator();
        this.location = shared.location;
        this.self = this;
        this.window = this;
      }
    }

    const window = new Window();

    // added by service-worker-mock, yet do not exist on window (client) global scope
    window._registration = window.self.registration;
    delete window.self.registration;
    delete window.ServiceWorkerGlobalScope;
    delete window.WindowClient;
    delete window.clients;

    return window;
  }
};
