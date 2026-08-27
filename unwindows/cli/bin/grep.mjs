#!/usr/bin/env node

import fs from 'node:fs';
import readline from 'node:readline';

function printUsage() {
  console.log(`
Usage:
  grep [options] <pattern> [file...]

Options:
  -i, --ignore-case    Case-insensitive matching
  -v, --invert-match   Select non-matching lines
  -E, --regexp         Treat pattern as regular expression
  -n, --line-number    Print line numbers
  -h, --no-filename    Do not print file names
  -H, --with-filename  Always print file names
  --help               Show this help

Examples:
  grep error app.log
  grep -i error app.log
  grep -v DEBUG app.log
  grep -E "^ERROR|^WARN" app.log
  cat app.log | grep -i error
  grep -in error app.log server.log
`.trim());
}

function parseArgs(argv) {
  const options = {
    ignoreCase: false,
    invert: false,
    regex: false,
    lineNumber: false,
    filename: null,
  };

  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--') {
      positional.push(...argv.slice(i + 1));
      break;
    }

    if (arg === '--help') {
      printUsage();
      process.exit(0);
    }

    if (arg === '--ignore-case') {
      options.ignoreCase = true;
      continue;
    }

    if (arg === '--invert-match') {
      options.invert = true;
      continue;
    }

    if (arg === '--regexp') {
      options.regex = true;
      continue;
    }

    if (arg === '--line-number') {
      options.lineNumber = true;
      continue;
    }

    if (arg === '--no-filename') {
      options.filename = false;
      continue;
    }

    if (arg === '--with-filename') {
      options.filename = true;
      continue;
    }

    if (arg.startsWith('-') && arg !== '-') {
      for (const flag of arg.slice(1)) {
        switch (flag) {
          case 'i':
            options.ignoreCase = true;
            break;
          case 'v':
            options.invert = true;
            break;
          case 'E':
            options.regex = true;
            break;
          case 'n':
            options.lineNumber = true;
            break;
          case 'h':
            options.filename = false;
            break;
          case 'H':
            options.filename = true;
            break;
          default:
            throw new Error(`Unknown option: -${flag}`);
        }
      }

      continue;
    }

    positional.push(arg);
  }

  if (positional.length === 0) {
    throw new Error('Missing pattern');
  }

  return {
    options,
    pattern: positional[0],
    files: positional.slice(1),
  };
}

function createMatcher(pattern, options) {
  if (options.regex) {
    let regex;

    try {
      regex = new RegExp(pattern, options.ignoreCase ? 'i' : '');
    } catch (error) {
      throw new Error(`Invalid regular expression: ${error.message}`);
    }

    return line => regex.test(line);
  }

  const expected = options.ignoreCase
    ? pattern.toLowerCase()
    : pattern;

  return line => {
    const actual = options.ignoreCase
      ? line.toLowerCase()
      : line;

    return actual.includes(expected);
  };
}

async function grepStream(stream, {
  matcher,
  invert,
  lineNumber,
  filename,
}) {
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let number = 0;
  let matched = false;

  for await (const line of rl) {
    number++;

    const isMatch = matcher(line);
    const selected = invert ? !isMatch : isMatch;

    if (!selected) {
      continue;
    }

    matched = true;

    const prefix = [
      filename,
      lineNumber ? number : null,
    ]
      .filter(value => value !== null)
      .join(':');

    process.stdout.write(
      prefix
        ? `${prefix}:${line}\n`
        : `${line}\n`,
    );
  }

  return matched;
}

async function main() {
  let parsed;

  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`grep: ${error.message}`);
    console.error(`Try 'grep --help' for more information.`);
    process.exitCode = 2;
    return;
  }

  const { options, pattern, files } = parsed;

  let matcher;

  try {
    matcher = createMatcher(pattern, options);
  } catch (error) {
    console.error(`grep: ${error.message}`);
    process.exitCode = 2;
    return;
  }

  let anyMatched = false;

  if (files.length === 0 || (files.length === 1 && files[0] === '-')) {
    anyMatched = await grepStream(process.stdin, {
      matcher,
      invert: options.invert,
      lineNumber: options.lineNumber,
      filename: null,
    });
  } else {
    const showFilename =
      options.filename ?? files.length > 1;

    for (const file of files) {
      if (file === '-') {
        const matched = await grepStream(process.stdin, {
          matcher,
          invert: options.invert,
          lineNumber: options.lineNumber,
          filename: showFilename ? '(standard input)' : null,
        });

        anyMatched ||= matched;
        continue;
      }

      try {
        const stream = fs.createReadStream(file, {
          encoding: 'utf8',
        });

        const matched = await grepStream(stream, {
          matcher,
          invert: options.invert,
          lineNumber: options.lineNumber,
          filename: showFilename ? file : null,
        });

        anyMatched ||= matched;
      } catch (error) {
        console.error(`grep: ${file}: ${error.message}`);
        process.exitCode = 2;
      }
    }
  }

  if (process.exitCode !== 2) {
    process.exitCode = anyMatched ? 0 : 1;
  }
}

await main();
