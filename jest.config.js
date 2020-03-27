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

const pkg = require('./package.json');

module.exports = {
  preset: 'amex-jest-preset',
  displayName: {
    name: 'service-worker',
    color: 'green',
  },
  collectCoverageFrom: ['src/**/*.js'],
  testMatch: ['<rootDir>/__tests__/**/*.spec.js'],
  testPathIgnorePatterns: ['<rootDir>/__tests__/integration/'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.js'],
  testEnvironment: '<rootDir>/jest.environment.js',
  testEnvironmentOptions: {
    target: 'shared',
    env: {
      NAME: pkg.name,
      VERSION: pkg.version,
      NODE_ENV: 'production',
    },
  },
};
