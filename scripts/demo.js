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

/* eslint-disable no-use-before-define, global-require, no-console, unicorn/no-process-exit */

const childProcess = () => require('child_process');
const net = () => require('net');
const fs = () => require('fs');

// Our socket address
const SOCKETFILE = '/tmp/demo-server-unix.sock';

const spawnCommand = (cmd, opts, sync) =>
  (sync ? childProcess().spawnSync : childProcess().spawn)(
    process.execPath,
    [__filename, cmd],
    opts,
  );

function spawnDemo(onListen) {
  const childSpawn = childProcess().spawn('npm', ['run', 'demo'], {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  childSpawn.stdout.on('data', message => {
    const msg = message.toString();
    if (/server is listening on [\d]{4,4}/.test(msg)) {
      process.nextTick(onListen);
    }
  });
  return childSpawn;
}

function clearIPCSocket(socketFile = SOCKETFILE) {
  if (fs().existsSync(socketFile)) {
    fs().unlinkSync(socketFile);
  }
}

function messageIPCSocket({ message, socketFile = SOCKETFILE }) {
  const client = net()
    .createConnection(socketFile, () => {
      client.write(message);
      client.unref();
    })
    .on('error', error => {
      if (error.code === 'ENOENT') {
        console.warn('no IPC server found at socket address %s', socketFile);
      } else throw error;
    });
  return client;
}

function createIPCMessageServer({ socketFile = SOCKETFILE, ...resolvers }) {
  const connections = {};
  const unrefConnections = () => Object.keys(connections).forEach(key => connections[key].unref());
  const server = net()
    .createServer(function onConnection(stream) {
      const self = Date.now();
      connections[self] = stream;

      stream
        .on('end', () => {
          delete connections[self];
        })
        .on('data', msg => {
          const message = msg.toString();
          if (message in resolvers) resolvers[message]();
          if (message === 'shutdown') {
            unrefConnections();
            server.unref();
          }
        });
    })
    .listen(socketFile);
  return server;
}

switch (process.argv[2]) {
  case 'demo-test-up': {
    const childSpawn = spawnCommand('demo-up', {
      detached: true,
      stdio: ['ignore', 'pipe', process.stderr],
    });

    childSpawn.stdout.on('data', data => {
      const msg = data.toString();
      if (msg.startsWith('detach')) {
        childSpawn.unref();
        process.exit(0);
      }
    });
    break;
  }
  case 'demo-test-down':
    messageIPCSocket({
      message: 'shutdown',
    });
    break;
  case 'demo-up': {
    // the log will trigger the initiating process to unref and exit
    // allowing the test command to be triggered
    const demoSpawn = spawnDemo(() => console.log('detach'));

    clearIPCSocket();
    createIPCMessageServer({
      shutdown: () => {
        // on shutdown command, the IPC server is unrefed and so are its connections.
        // In addition, we kill off the child process and allow the current process to die
        demoSpawn.kill();
      },
    });
    break;
  }
  default:
    throw new Error('You need to call with a matching argument');
}
