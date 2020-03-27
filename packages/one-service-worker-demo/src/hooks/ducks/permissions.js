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

export const permissionQueryNames = [
  ['geolocation'],
  ['notifications'],
  ['push', { userVisibleOnly: true }],
  ['midi', { sysex: true }],
  ['camera'],
  ['microphone'],
  ['background-sync'],
  ['accelerometer'],
  ['gyroscope'],
  ['magnetometer'],
];

export const RESET_PERMISSIONS_KEY = '@@permissions/reset';
export const DEFAULT_STATE_KEY = 'default';
export const GRANTED_STATE_KEY = 'granted';
export const DENIED_STATE_KEY = 'denied';

export const permissionsInitialState = permissionQueryNames.reduce(
  (initialState, [name]) => ({
    ...initialState,
    [name]: 'default',
  }),
  {},
);

export function permissionsReducer(state = permissionsInitialState, action) {
  switch (action.type) {
    case RESET_PERMISSIONS_KEY:
      return permissionsInitialState;
    case DEFAULT_STATE_KEY:
      return { ...state, [action.name]: DEFAULT_STATE_KEY };
    case GRANTED_STATE_KEY:
      return { ...state, [action.name]: GRANTED_STATE_KEY };
    case DENIED_STATE_KEY:
      return { ...state, [action.name]: DENIED_STATE_KEY };
    default:
      return state;
  }
}

export function isDefault(featureName) {
  return state => state[featureName] === DEFAULT_STATE_KEY;
}
export function isGranted(featureName) {
  return state => state[featureName] === GRANTED_STATE_KEY;
}
export function isDenied(featureName) {
  return state => state[featureName] === DENIED_STATE_KEY;
}

export function setPermission(featureName, currentState) {
  return dispatch => dispatch({ type: currentState, name: featureName });
}
export function resetPermissions() {
  return dispatch =>
    dispatch({
      type: RESET_PERMISSIONS_KEY,
    });
}
