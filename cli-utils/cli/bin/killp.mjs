#!/usr/bin/env node
// killp: force-kill a process by PID.
//
// Usage:
//   killp <PID>

import { killPid } from '../lib/process.mjs';

const pid = Number(process.argv[2]);

if (!process.argv[2] || Number.isNaN(pid)) {
  console.error('Usage: killp <PID>');
  process.exit(1);
}

console.log(`Killing PID ${pid} ...`);
const result = killPid(pid);

if (!result.ok) {
  console.error(`[ERROR] ${result.reason}`);
  process.exit(1);
}

console.log(`PID ${pid} killed.`);
