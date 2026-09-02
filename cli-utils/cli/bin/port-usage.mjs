#!/usr/bin/env node
// port-usage: show (and optionally kill) whatever process is listening on a
// given TCP port.
//
// Usage:
//   port-usage <port> [--kill]

import { createInterface } from 'node:readline/promises';
import { findByPort, killPid } from '../lib/process.mjs';

const port = process.argv[2];
const shouldKill = process.argv[3]?.toLowerCase() === '--kill';

if (!port || Number.isNaN(Number(port))) {
  console.error('Usage: port-usage <port> [--kill]');
  process.exit(1);
}

console.log(`=== TCP ${port} usage ===`);

const processes = await findByPort(Number(port));

if (processes.length === 0) {
  console.log(`No process is listening on port ${port}.`);
  process.exit(0);
}

const rl = shouldKill ? createInterface({ input: process.stdin, output: process.stdout }) : null;

for (const proc of processes) {
  console.log(`PID: ${proc.pid}`);
  console.log(`Name: ${proc.name}`);
  console.log(`Command: ${proc.cmd}`);
  console.log('');

  if (shouldKill) {
    const answer = await rl.question(`Kill process ${proc.pid}? [y/N]: `);
    if (answer.toLowerCase() === 'y') {
      const result = killPid(proc.pid);
      console.log(result.ok ? `Killed PID ${proc.pid}.` : `[ERROR] ${result.reason}`);
    } else {
      console.log('Skipped.');
    }
    console.log('');
  }
}

rl?.close();
