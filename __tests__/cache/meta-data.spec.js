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

import {
  createMetaCacheName,
  createMetaCacheEntryName,
  createMetaRequest,
  createMetaResponse,
  getMetaData,
  setMetaData,
  deleteMetaData,
  metaDataCacheName,
  createCacheEntryName,
} from '../../src/cache/meta-data';
import { clear, defaultCacheName, cachePrefix, cacheDelimiter } from '../../src/cache/cache';

beforeEach(async () => {
  await clear();
});

describe('createCacheEntryName - deprecated', () => {
  beforeAll(() => {
    jest.spyOn(console, 'warn');
    console.warn.mockImplementation();
  });

  test('warns about the deprecation', () => {
    const cacheName = 'my-cache';
    expect(createCacheEntryName(cacheName)).toEqual(createMetaCacheEntryName(cacheName));
    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});

describe('createMetaCacheName', () => {
  test('returns the cache name to use for meta data', () => {
    expect.assertions(1);

    expect(createMetaCacheName()).toEqual(`${cachePrefix}${cacheDelimiter}${metaDataCacheName}`);
  });
});

describe('createMetaCacheEntryName', () => {
  test('returns a prefixed url based on the cache name', () => {
    expect.assertions(1);

    expect(createMetaCacheEntryName()).toEqual(
      `/${cachePrefix}${cacheDelimiter}${metaDataCacheName}/${defaultCacheName}`,
    );
  });
});

describe('createMetaRequest', () => {
  test('returns a created request based on the cache name', () => {
    expect.assertions(2);

    const metaRequest = createMetaRequest();

    expect(metaRequest).toEqual(new Request(createMetaCacheEntryName()));
    expect(metaRequest.url).toMatch(createMetaCacheEntryName());
  });
});

describe('createMetaResponse', () => {
  test('creates an empty response without url or data', async () => {
    expect.assertions(1);

    expect(createMetaResponse()).toEqual(
      new Response(JSON.stringify({}), {
        headers: new Headers({
          'content-type': 'application/json',
        }),
        status: 200,
      }),
    );
  });

  test('returns a created response, based on the cache name and with metadata as its body', async () => {
    expect.assertions(2);

    const { url } = new Request('/sw.js');
    const data = {
      [url]: {
        expires: 100,
      },
    };
    const response = createMetaResponse({
      url,
      data,
    });
    const headers = new Headers({});
    headers.append('content-type', 'application/json');
    const expectedResponse = new Response(JSON.stringify(data), {
      url,
      headers,
    });
    const json = await response.clone().json();

    expect(response).toEqual(expectedResponse);
    expect(json).toEqual(data);
  });
});

describe('getMetaData', () => {
  test('getMetaData returns default meta cache without arguments', async () => {
    expect.assertions(1);

    await expect(getMetaData()).resolves.toEqual({});
  });

  test('getMetaData returns an object when no match found', async () => {
    expect.assertions(1);

    await expect(getMetaData({ url: '/unknown-key' })).resolves.toEqual({});
  });

  test('getMetaData returns the metadata without a url', async () => {
    expect.assertions(1);

    const metadata = {
      'my-custom-key': {
        expires: Math.random(),
      },
    };

    await setMetaData({
      metadata,
    });

    await expect(getMetaData()).resolves.toEqual(metadata);
  });

  test('getMetaData returns the the metadata for a given url', async () => {
    expect.assertions(1);

    const url = '/resource.js';
    const metadata = {
      expires: Math.random(),
    };

    await setMetaData({
      url,
      metadata,
    });

    await expect(getMetaData({ url })).resolves.toEqual(metadata);
  });
});

describe('setMetaData', () => {
  test('returns null without arguments', async () => {
    expect.assertions(1);

    await expect(setMetaData()).resolves.toBe(null);
  });

  test('sets the metadata cache', async () => {
    expect.assertions(2);

    const metadata = {
      'my-custom-key': {
        expires: Math.random(),
      },
    };

    await expect(
      setMetaData({
        metadata,
      }),
    ).resolves.toEqual(metadata);
    await expect(getMetaData()).resolves.toEqual(metadata);
  });

  test('setMetaData adds the url to cache metadata', async () => {
    expect.assertions(2);

    const url = '/index.js';
    const request = new Request(url);
    const metadata = {
      expires: Math.random(),
    };

    await expect(
      setMetaData({
        url: request.url,
        metadata,
      }),
    ).resolves.toEqual(metadata);
    await expect(
      getMetaData({
        url: request.url,
      }),
    ).resolves.toEqual(metadata);
  });

  test('setMetaData returns only the metadata for the url given', async () => {
    expect.assertions(3);

    const url = '/index.js';
    const request = new Request(url);
    const metadata = {
      expires: Math.random(),
    };
    const expectedMetaData = {
      [request.url]: metadata,
    };

    await expect(
      setMetaData({
        url: request.url,
        metadata,
      }),
    ).resolves.toEqual(metadata);
    await expect(getMetaData()).resolves.toEqual(expectedMetaData);
    await expect(
      getMetaData({
        url: request.url,
      }),
    ).resolves.toEqual(metadata);
  });
});

describe('deleteMetaData', () => {
  test('returns false without arguments', async () => {
    expect.assertions(1);

    await expect(deleteMetaData()).resolves.toBe(false);
  });

  test('removes a cache store by cacheName', async () => {
    expect.assertions(2);

    const cacheName = 'my-custom-key';
    await setMetaData({
      cacheName,
      metadata: {
        [new Request(cacheName).url]: {
          expires: Math.random(),
        },
      },
    });

    await expect(
      deleteMetaData({
        cacheName,
      }),
    ).resolves.toEqual(true);
    await expect(getMetaData()).resolves.toEqual({});
  });

  test('removes a key from the metadata', async () => {
    expect.assertions(2);

    const customKey = 'my-custom-key';
    await setMetaData({
      metadata: {
        [new Request(customKey).url]: {
          expires: Math.random(),
        },
      },
    });

    await expect(
      deleteMetaData({
        url: customKey,
      }),
    ).resolves.toEqual(true);
    await expect(getMetaData()).resolves.toEqual({});
  });

  test('removes only the url passed from the cache metadata', async () => {
    expect.assertions(2);

    const url = '/index.js';

    await setMetaData({
      url,
      metadata: {
        'some-data': 'to-store',
      },
    });
    await setMetaData({
      url: '/other-data',
      metadata: {
        'some-other-data': 'to-store',
      },
    });

    await expect(
      deleteMetaData({
        url,
      }),
    ).resolves.toEqual(true);
    await expect(getMetaData()).resolves.toEqual({
      [new Request('/other-data').url]: {
        'some-other-data': 'to-store',
      },
    });
  });
});
