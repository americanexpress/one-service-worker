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
  open,
  has,
  keys,
  entries,
  match,
  matchAll,
  add,
  addAll,
  put,
  remove,
  removeAll,
  clear,
  normalizeRequest,
  createCacheName,
  cacheDelimiter,
  cachePrefix,
  defaultCacheOptions,
} from '../../src/cache/cache';

const cacheName = 'my-cache';
const html = '/index.html';
const fonts = '/css/fonts.css';
const styles = '/css/styles.css';

beforeEach(async () => {
  await clear();
});

describe('playground', () => {
  test('caching', async () => {
    expect.assertions(22);

    const requests = [fonts, styles];
    const request = new Request('/cache-sandbox.js');
    const response = new Response(`console.log('coding-sandbox');`, {
      url: request.url,
    });

    // normalizes our request
    expect(normalizeRequest('/index.js')).toEqual(new Request('/index.js'));
    // can open a cache
    await expect(open(cacheName)).resolves.toBeInstanceOf(Cache);
    // has checks if the cache exists
    await expect(has(cacheName)).resolves.toBe(true);
    // adds a request and fetches the response
    await expect(add(html, { cacheName })).resolves.toEqual(undefined);
    // would match
    await expect(match(html)).resolves.toEqual(expect.any(Response));
    // would not match different cache name
    await expect(match(html, { cacheName: createCacheName() })).resolves.toBe(null);
    // matches the newly added response with cache specified
    await expect(match(html, { cacheName })).resolves.toEqual(expect.any(Response));
    // returns only the single html we added
    await expect(keys(undefined, { cacheName })).resolves.toMatchObject([expect.any(Request)]);
    // we add a few at a time
    await expect(addAll(requests)).resolves.toEqual([undefined, undefined]);
    // we should be able to match the fonts
    await expect(match(fonts)).resolves.toEqual(expect.any(Response));
    // and styles
    await expect(match(styles)).resolves.toEqual(expect.any(Response));
    // and both
    await expect(matchAll([fonts, styles])).resolves.toMatchObject(
      expect.arrayContaining([expect.any(Response), expect.any(Response)]),
    );
    // returning two key requests that we added with addAll
    await expect(keys()).resolves.toMatchObject([expect.any(Request), expect.any(Request)]);
    // putting in a request / response
    await expect(put(request.clone(), response.clone())).resolves.toEqual(undefined);
    // matches the request
    await expect(match(request.clone())).resolves.toEqual(expect.any(Response));
    // entries returns [[Request], Cache, cacheName]
    await expect(entries()).resolves.toEqual([
      [expect.arrayContaining([expect.any(Request)]), expect.any(Cache), expect.any(String)],
      [
        expect.arrayContaining([expect.any(Request), expect.any(Request), expect.any(Request)]),
        expect.any(Cache),
        expect.any(String),
      ],
    ]);
    // removal
    // expect the default cache name  to fail
    await expect(remove(html)).resolves.toEqual(false);
    // the right cache name will match and delete
    await expect(remove(html, { cacheName })).resolves.toEqual(true);
    // // removing all
    // will fail with wrong cache name
    await expect(removeAll(requests, { cacheName })).resolves.toEqual([false, false]);
    // returns true on success
    await expect(removeAll(requests)).resolves.toEqual([true, true]);
    // matching what remains
    // make sure all requests are null except remaining request
    await expect(match(request.clone())).resolves.toEqual(response);
    await expect(matchAll(requests.concat(html, request.clone()))).resolves.toEqual([
      null,
      null,
      null,
      expect.any(Response),
    ]);
  });
});

describe('createCacheName', () => {
  test('returns a string from a given cacheName', async () => {
    expect.assertions(1);

    const myCacheName = 'my-cache';
    expect(createCacheName(myCacheName)).toEqual(
      [cachePrefix, cacheDelimiter, myCacheName].join(''),
    );
  });
});

describe('normalizeRequest', () => {
  test('returns a request with the string url passed in', async () => {
    expect.assertions(1);

    expect(normalizeRequest('/index.js')).toEqual(new Request('/index.js'));
  });
});

describe('open', () => {
  test('open defaults to new cache with the default name', async () => {
    expect.assertions(3);

    await expect(has()).resolves.toBe(false);
    await expect(open()).resolves.toBeInstanceOf(Cache);
    await expect(has()).resolves.toBe(true);
  });

  test('open creates a new cache with the given name', async () => {
    expect.assertions(3);

    await expect(has(cacheName)).resolves.toBe(false);
    await expect(open(cacheName)).resolves.toBeInstanceOf(Cache);
    await expect(has(cacheName)).resolves.toBe(true);
  });
});

describe('has', () => {
  test('has checks for default cache name if no given name', async () => {
    expect.assertions(5);

    await expect(has()).resolves.toBe(false);
    await expect(has(cacheName)).resolves.toBe(false);
    await expect(open(cacheName)).resolves.toBeInstanceOf(Cache);
    await expect(has(cacheName)).resolves.toBe(true);
    await expect(has()).resolves.toBe(false);
  });
});

describe('keys', () => {
  test('returns all the keys in the cache', async () => {
    expect.assertions(3);

    await expect(keys()).resolves.toHaveLength(0);

    await addAll(['/index.js', '/analytics.js']);
    const result = await keys();

    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([expect.any(Request)]));
  });
});

describe('entries', () => {
  test('returns the entries of the cache', async () => {
    expect.assertions(2);

    await expect(entries()).resolves.toEqual([]);

    await addAll(['/index.js', '/analytics.js']);

    await expect(entries()).resolves.toEqual([
      [await keys(), await open(), defaultCacheOptions.cacheName],
    ]);
  });

  test('can select which caches is returned', async () => {
    expect.assertions(4);

    await expect(entries()).resolves.toEqual([]);

    await addAll(['/index.js', '/analytics.js']);

    const randomCacheName = 'random';

    await expect(entries(randomCacheName)).resolves.toEqual([
      [[], await open(randomCacheName), randomCacheName],
    ]);
    await expect(entries([randomCacheName])).resolves.toEqual([
      [[], await open(randomCacheName), randomCacheName],
    ]);
    await expect(entries()).resolves.toEqual([
      [await keys(), await open(), defaultCacheOptions.cacheName],
      [[], await open(randomCacheName), randomCacheName],
    ]);
  });
});

describe('match', () => {
  const requests = [fonts, styles];

  beforeEach(async () => {
    await addAll(requests);
  });

  test('matches current requests in cache', async () => {
    expect.assertions(3);

    await expect(match('/random.url')).resolves.toEqual(null);
    await expect(match(fonts)).resolves.toEqual(expect.any(Response));
    await expect(match(styles)).resolves.toEqual(expect.any(Response));
  });
});

describe('matchAll', () => {
  const requests = [fonts, styles];

  beforeEach(async () => {
    await addAll(requests);
  });

  test('matchAll accepts array of requests and returns the responses', async () => {
    expect.assertions(1);

    await expect(matchAll([fonts, styles])).resolves.toMatchObject(
      expect.arrayContaining([expect.any(Response), expect.any(Response)]),
    );
  });

  test('matchAll accepts a string for a request and returns the response in an array', async () => {
    expect.assertions(1);

    await expect(matchAll(fonts)).resolves.toMatchObject(
      expect.arrayContaining([expect.any(Response)]),
    );
  });
});

describe('add', () => {
  const request = new Request('/index.js');

  test('add does accept empty arguments', async () => {
    expect.assertions(1);

    await expect(add()).rejects.toThrowErrorMatchingInlineSnapshot(`"Invalid URL"`);
  });

  test('add accepts a request, returns void and response expected in cache', async () => {
    expect.assertions(2);

    await expect(add(request.clone())).resolves.toBeUndefined();
    await expect(match(request.clone())).resolves.toEqual(expect.any(Response));
  });
});

describe('addAll', () => {
  const requests = ['/home.html', '/info.html'];

  test('addAll accepts no arguments without failure', async () => {
    expect.assertions(1);
    await expect(addAll()).resolves.toEqual([]);
  });

  test('addAll accepts requests, caches the requests and returns void for each cached resource', async () => {
    expect.assertions(2);

    await expect(addAll(requests)).resolves.toEqual([undefined, undefined]);
    await expect(matchAll(requests)).resolves.toMatchObject(
      expect.arrayContaining([expect.any(Response), expect.any(Response)]),
    );
  });
});

describe('put', () => {
  const request = new Request('/app.js');
  const response = new Response('console.log("app.js");', {
    url: request.url,
  });

  test('puts a request and response pair into the cachea', async () => {
    expect.assertions(2);

    await expect(put(request.clone(), response.clone())).resolves.toBeUndefined();
    await expect(match(request.clone())).resolves.toEqual(expect.any(Response));
  });
});

describe('remove', () => {
  const requests = [fonts, styles];

  beforeEach(async () => {
    await addAll(requests);
  });

  test('remove deletes the given request from the cache', async () => {
    expect.assertions(3);

    await expect(remove(fonts)).resolves.toEqual(true);
    await expect(match(fonts)).resolves.toEqual(null);
    await expect(match(styles)).resolves.toEqual(expect.any(Response));
  });
});

describe('removeAll', () => {
  const requests = [fonts, styles];

  beforeEach(async () => {
    await addAll(requests);
  });

  test('removeAll does nothing without arguments', async () => {
    expect.assertions(1);

    await expect(removeAll()).resolves.toEqual([]);
  });

  test('removeAll removes both cache items and returns true, otherwise returns false for both requests if they do not exist', async () => {
    expect.assertions(2);

    await expect(removeAll(requests)).resolves.toEqual([true, true]);
    await expect(removeAll(requests)).resolves.toEqual([false, false]);
  });
});

describe('clear', () => {
  const requests = [fonts, styles];

  beforeEach(async () => {
    await addAll(requests);
  });

  test('clear removes everything without arguments', async () => {
    expect.assertions(2);

    await expect(clear()).resolves.toEqual([true]);
    await expect(entries()).resolves.toEqual([]);
  });

  test('clear accepts only one callback', async () => {
    expect.assertions(2);

    await expect(clear(() => true)).resolves.toEqual([true]);
    await expect(entries()).resolves.toEqual([]);
  });

  test('clear accepts undefined argument and removes only the caches', async () => {
    expect.assertions(1);

    await expect(clear(undefined, () => false)).resolves.toEqual([true, true]);
  });

  test('clear removes nothing when both input functions return false', async () => {
    await expect(
      clear(
        () => false,
        () => false,
      ),
    ).resolves.toEqual([]);
    await expect(entries()).resolves.toEqual([
      [
        expect.arrayContaining([expect.any(Request), expect.any(Request), expect.any(Request)]),
        expect.any(Cache),
        expect.any(String),
      ],
    ]);
  });

  test('clear removes requests without removing the cache', async () => {
    expect.assertions(2);

    await expect(
      clear(
        () => true,
        () => false,
      ),
    ).resolves.toEqual([true, true]);
    await expect(entries()).resolves.toEqual([[[], expect.any(Cache), expect.any(String)]]);
  });

  test('clear removes the caches only', async () => {
    expect.assertions(2);

    await expect(
      clear(
        () => false,
        () => true,
      ),
    ).resolves.toEqual([true]);
    await expect(entries()).resolves.toEqual([]);
  });
});
