#!/usr/bin/env node
// nc: minimal netcat-like TCP reachability check, implemented with Node's
// built-in net module (no PowerShell/Test-NetConnection dependency).
//
// Usage:
//   nc [-zv|-vz] <host> <port>
//
// Flag-like arguments (starting with "-") are accepted for familiarity but
// ignored, matching the previous PowerShell wrapper's behavior.

import { Socket } from 'node:net';

const values = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));

if (values.length !== 2) {
  console.log('Usage: nc [-zv|-vz] <host> <port>');
  process.exit(1);
}

const [host, portArg] = values;
const port = Number(portArg);

if (!Number.isInteger(port)) {
  console.error(`Invalid port: ${portArg}`);
  process.exit(1);
}

const TIMEOUT_MS = 5000;

const succeeded = await new Promise((resolve) => {
  const socket = new Socket();
  socket.setTimeout(TIMEOUT_MS);
  socket.once('connect', () => {
    socket.destroy();
    resolve(true);
  });
  socket.once('timeout', () => {
    socket.destroy();
    resolve(false);
  });
  socket.once('error', () => {
    socket.destroy();
    resolve(false);
  });
  socket.connect(port, host);
});

if (succeeded) {
  console.log(`Connection to ${host} ${port} port [tcp/*] succeeded!`);
  process.exit(0);
} else {
  console.log(`nc: connect to ${host} port ${port} (tcp) failed`);
  process.exit(1);
}
