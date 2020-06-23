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

import resolve from '@rollup/plugin-node-resolve';
import buble from '@rollup/plugin-buble';
import alias from '@rollup/plugin-alias';
import replace from 'rollup-plugin-re';
import cleanup from 'rollup-plugin-cleanup';
import copy from 'rollup-plugin-copy';

export const intro = `
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
`.trim();

const targetPath = 'dist';

const plugins = [
  replace({
    patterns: [
      {
        test: 'process.env.NODE_ENV',
        replace: JSON.stringify(`${'development'}`),
      },
      {
        test: 'process.env.ONE_SW_USE_NON_STANDARD',
        replace: JSON.stringify(`${true}`),
      },
      {
        test: 'process.env.ONE_SW_USE_NAVIGATION_PRELOAD',
        replace: JSON.stringify(`${true}`),
      },
      {
        test: 'process.env.ONE_SW_USE_EVENTS',
        replace: JSON.stringify(`${true}`),
      },
      {
        test: 'process.env.ONE_SW_MARK_PERFORMANCE',
        replace: JSON.stringify(`${true}`),
      },
    ],
  }),
  resolve({
    extensions: ['.js', '.jsx'],
    preferBuiltins: true,
  }),
  buble({
    transforms: {
      letConst: false,
      asyncAwait: false,
    },
    objectAssign: 'Object.assign',
    jsx: 'React.createElement',
  }),
  cleanup(),
];

const { server, worker, client } = {
  server: {
    plugins: [
      copy({
        targets: [
          {
            src: 'static/index.html',
            dest: `${targetPath}/public`,
          },
          {
            src: 'static/manifest.webmanifest',
            dest: `${targetPath}/public`,
          },
          {
            src: 'static/images/**/*',
            dest: `${targetPath}/public/images`,
          },
          {
            src: 'static/audio/**/*',
            dest: `${targetPath}/public/audio`,
          },
        ],
      }),
    ].concat(plugins),
    external: ['express', 'body-parser', 'web-push', 'url', 'fs', 'path'],
    input: 'src/server/index.js',
    output: {
      intro,
      file: `${targetPath}/index.js`,
      format: 'cjs',
      interop: false,
      preferConst: true,
    },
  },
  worker: {
    plugins: [
      alias({
        entries: [
          {
            find: '@americanexpress/one-service-worker',
            replacement: '../../src/index.js',
          },
        ],
      }),
    ].concat(plugins),
    input: 'src/client/sw.js',
    output: {
      intro,
      format: 'es',
      file: `${targetPath}/public/sw.js`,
      paths: {
        '@americanexpress/one-service-worker': '../../src/index.js',
      },
    },
  },
  client: {
    plugins,
    input: {
      '@americanexpress/one-service-worker': '../../src/index.js',
      'scripts/client': 'src/client/index.js',
      'scripts/react': 'src/client/react.js',
      'scripts/react-dom': 'src/client/react-dom.js',
      'scripts/prop-types': 'src/client/prop-types.js',
    },
    output: {
      intro,
      dir: `${targetPath}/public`,
      format: 'esm',
      paths: {
        react: '/scripts/react.js',
        'react-dom': '/scripts/react-dom.js',
        'prop-types': '/scripts/prop-types.js',
        '@americanexpress/one-service-worker': '/@americanexpress/one-service-worker.js',
      },
    },
    context: 'self',
    external: ['react', 'react-dom', 'prop-types', '@americanexpress/one-service-worker'],
  },
};

export default [server, worker, client];
