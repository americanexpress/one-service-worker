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
import babel from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import replace from 'rollup-plugin-re';
import { uglify } from 'rollup-plugin-uglify';
import gzip from 'rollup-plugin-gzip';

import pkg from './package.json';

const {
  NODE_ENV = 'production',
  ONE_SW_USE_EVENTS = 'true',
  ONE_SW_USE_NON_STANDARD = 'true',
  ONE_SW_USE_NAVIGATION_PRELOAD = 'false',
  ONE_SW_MARK_PERFORMANCE = 'false',
  ONE_SW_MINIFY = 'false',
} = process.env;

export const defaultConfig = {
  name: '',
  version: '',
  environment: NODE_ENV,
  useEvents: ONE_SW_USE_EVENTS === 'true',
  useNonStandard: ONE_SW_USE_NON_STANDARD === 'true',
  useNavigationPreload: ONE_SW_USE_NAVIGATION_PRELOAD === 'true',
  markPerformance: ONE_SW_MARK_PERFORMANCE === 'true',
  minify: ONE_SW_MINIFY === 'true',
};

export const defaultGlobals = {};

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

export function createPatterns({
  name,
  version,
  environment,
  useEvents,
  useNonStandard,
  useNavigationPreload,
  markPerformance,
} = defaultConfig) {
  const patterns = [
    {
      test: 'process.env.PACKAGE_NAME',
      replace: JSON.stringify(`${name}`),
    },
    {
      test: 'process.env.PACKAGE_VERSION',
      replace: JSON.stringify(`${version}`),
    },
    {
      test: 'process.env.NODE_ENV',
      replace: JSON.stringify(`${environment}`),
    },
    // variables
    {
      test: 'process.env.ONE_SW_USE_NON_STANDARD',
      replace: JSON.stringify(`${useNonStandard}`),
    },
    {
      test: 'process.env.ONE_SW_USE_NAVIGATION_PRELOAD',
      replace: JSON.stringify(`${useNavigationPreload}`),
    },
    {
      test: 'process.env.ONE_SW_USE_EVENTS',
      replace: JSON.stringify(`${useEvents}`),
    },
    // build options
    {
      test: 'process.env.ONE_SW_MARK_PERFORMANCE',
      replace: JSON.stringify(`${markPerformance}`),
    },
  ];

  return patterns;
}

export function createPlugins(config = defaultConfig) {
  return [
    replace({
      patterns: createPatterns(config),
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
}

export function createLibraryConfig(config = defaultConfig) {
  const plugins = createPlugins(config);
  const external = [];

  const library = {
    external,
    input: {
      index: 'src/index.js',
      core: 'src/core/index.js',
      utility: 'src/utility/index.js',
      cache: 'src/cache/index.js',
      middleware: 'src/middleware/index.js',
      runtime: 'src/utility/runtime/index.js',
      errors: 'src/utility/errors/index.js',
      validation: 'src/utility/validation/index.js',
      events: 'src/utility/events/index.js',
    },
    output: {
      intro,
      dir: 'es',
      format: 'es',
      preferConst: true,
    },
    plugins,
  };

  const distribution = {
    external,
    input: 'src/index.js',
    output: [
      {
        intro,
        file: pkg.module,
        format: 'esm',
      },
      {
        intro,
        file: pkg.main,
        format: 'cjs',
      },
      {
        intro,
        file: pkg.browser,
        format: 'umd',
        name: 'oneServiceWorker',
        globals: defaultGlobals,
      },
    ],
    plugins,
  };

  const jobs = [library, distribution];

  if (config.minify) {
    jobs.push({
      external,
      input: pkg.module,
      output: {
        intro,
        file: 'index.min.js',
        format: 'umd',
        name: 'oneServiceWorker',
        globals: defaultGlobals,
      },
      plugins: [
        resolve({
          extensions: ['.js', '.jsx'],
        }),
        babel(),
        uglify(),
        gzip(),
      ],
    });
  }

  return jobs;
}

export function createRollupConfig(options = {}) {
  const { perf, ...config } = {
    ...defaultConfig,
    ...options,
  };

  const jobs = createLibraryConfig(config);

  if (perf) {
    jobs.forEach(() => {
      const job = jobs.pop();
      job.perf = perf;
      jobs.unshift(job);
    });
  }

  return jobs;
}

export default createRollupConfig({
  name: pkg.name,
  version: pkg.version,
  minify: true,
  demo: true,
  perf: false,
});
