#!/usr/bin/env node
// uuid: generate a UUID (v1, v4, v6, v7, or v8) and copy it to the clipboard.
//
// Usage:
//   uuid [-v <1|4|6|7|8>] [-u] [-n] [-p]
//
// Options:
//   -v, --version    UUID version to generate (default: 4)
//   -u, --upper      output uppercase hexadecimal letters
//   -n, --no-dash    remove hyphens from the UUID
//   -p, --print-only print the UUID without copying it to the clipboard

import { randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';
import { v1, v4, v6, v7 } from 'uuid';
import { copyToClipboard } from '../lib/clipboard.mjs';

const SUPPORTED_VERSIONS = [1, 4, 6, 7, 8];

function uuid8() {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x80; // version 8
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC variant
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const GENERATORS = { 1: v1, 4: v4, 6: v6, 7: v7, 8: uuid8 };

const { values } = parseArgs({
  options: {
    version: { type: 'string', short: 'v', default: '4' },
    upper: { type: 'boolean', short: 'u', default: false },
    'no-dash': { type: 'boolean', short: 'n', default: false },
    'print-only': { type: 'boolean', short: 'p', default: false },
  },
});

const version = Number(values.version);
if (!SUPPORTED_VERSIONS.includes(version)) {
  console.error(`Unsupported UUID version: ${values.version}. Supported: ${SUPPORTED_VERSIONS.join(', ')}`);
  process.exit(1);
}

console.log(`Using UUID version ${version}`);

let output = GENERATORS[version]();

if (values.upper) {
  console.log('Converted to uppercase');
  output = output.toUpperCase();
}

if (values['no-dash']) {
  console.log('Removed hyphens');
  output = output.replaceAll('-', '');
}

console.log(output);

if (!values['print-only']) {
  const result = await copyToClipboard(output);
  if (result.ok) {
    console.log('Copied to clipboard');
  } else {
    console.warn(`Warning: ${result.reason}`);
    process.exit(1);
  }
}
