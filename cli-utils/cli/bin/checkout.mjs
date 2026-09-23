#!/usr/bin/env node

// checkout: interactive git branch checkout utility

// Usage:
//   checkout

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  select,
  Separator,
} from '@inquirer/prompts';

const execFileAsync = promisify(execFile);

async function git(...args) {
  try {
    return await execFileAsync('git', args, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    // Prefer Git's own error message over the generic child_process error.
    const message =
      error.stderr?.trim() ||
      error.stdout?.trim() ||
      error.message;

    throw new Error(message);
  }
}

async function assertGitRepo() {
  try {
    const { stdout } = await git(
      'rev-parse',
      '--is-inside-work-tree',
    );

    if (stdout.trim() !== 'true') {
      throw new Error();
    }
  } catch {
    throw new Error('Not inside a Git repository.');
  }
}

async function getBranches() {
  // Use machine-readable ref data instead of parsing the human-facing
  // output of `git branch`.
  const { stdout } = await git(
    'for-each-ref',
    '--format=%(refname)%09%(HEAD)%09%(upstream:short)',
    'refs/heads',
    'refs/remotes',
  );

  const branches = stdout
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [ref, head, upstream] = line.split('\t');

      if (ref.startsWith('refs/heads/')) {
        return {
          type: 'local',
          name: ref.slice('refs/heads/'.length),
          current: head === '*',
          upstream,
        };
      }

      if (ref.startsWith('refs/remotes/')) {
        return {
          type: 'remote',
          name: ref.slice('refs/remotes/'.length),
          current: false,
          upstream: '',
        };
      }

      return null;
    })
    .filter(Boolean)
    // origin/HEAD and similar refs are symbolic convenience refs,
    // not actual remote branches that should be selected.
    .filter(branch => !branch.name.endsWith('/HEAD'));

  const locals = branches
    .filter(branch => branch.type === 'local')
    .sort((a, b) => {
      // Keep the currently checked-out branch at the top.
      if (a.current !== b.current) {
        return a.current ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

  const remotes = branches
    .filter(branch => branch.type === 'remote')
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    locals,
    remotes,
  };
}

function branchLabel(branch) {
  if (branch.type === 'local') {
    const marker = branch.current ? '*' : ' ';

    if (branch.upstream) {
      return `${marker} ${branch.name}  → ${branch.upstream}`;
    }

    return `${marker} ${branch.name}`;
  }

  return `  ${branch.name}`;
}

async function chooseBranch({ locals, remotes }) {
  const choices = [];

  if (locals.length > 0) {
    choices.push(
      new Separator('── Local ──'),
      ...locals.map(branch => ({
        name: branchLabel(branch),
        value: branch,
      })),
    );
  }

  if (remotes.length > 0) {
    choices.push(
      new Separator('── Remote ──'),
      ...remotes.map(branch => ({
        name: branchLabel(branch),
        value: branch,
      })),
    );
  }

  choices.push(
    new Separator(),
    {
      name: '↻ Fetch',
      value: 'refresh',
    },
    {
      name: '✕ Exit',
      value: 'exit',
    },
  );

  return select({
    message: 'Branch',
    pageSize: 24,
    choices,
  });
}

function localNameForRemote(remoteName) {
  // Strip only the remote name.
  //
  // origin/feature/foo -> feature/foo
  // upstream/main     -> main
  const slash = remoteName.indexOf('/');

  if (slash === -1) {
    return remoteName;
  }

  return remoteName.slice(slash + 1);
}

async function checkoutLocal(branch) {
  // Selecting the current branch is effectively a no-op.
  if (branch.current) {
    return;
  }

  await git('switch', branch.name);
}

async function checkoutRemote(branch, locals) {
  const localName = localNameForRemote(branch.name);

  const existing = locals.find(
    local => local.name === localName,
  );

  if (existing) {
    // Do not silently modify the upstream of an existing local branch.
    // Simply switch to it.
    await git('switch', existing.name);
    return;
  }

  // Create a local branch with the same branch path and configure
  // the selected remote branch as its upstream.
  //
  // Example:
  //   origin/feature/foo
  // becomes:
  //   git switch --track -c feature/foo origin/feature/foo
  await git(
    'switch',
    '--track',
    '-c',
    localName,
    branch.name,
  );
}

async function checkout(branch, branches) {
  if (branch.type === 'local') {
    await checkoutLocal(branch);
    return;
  }

  await checkoutRemote(branch, branches.locals);
}

async function waitAfterError(message) {
  console.error(message);

  await select({
    message: 'Command failed',
    choices: [
      {
        name: '← Back',
        value: 'back',
      },
    ],
  });
}

async function fetch() {
  process.stdout.write('Fetching... ');

  try {
    const { stdout, stderr } = await git('fetch');

    // Git often writes progress/status information to stderr even when
    // the command succeeds.
    const output =
      stderr.trim() ||
      stdout.trim();

    console.log(output || 'done');
  } catch (error) {
    console.log('failed');

    await waitAfterError(error.message);
  }
}

async function main() {
  await assertGitRepo();

  while (true) {
    let branches;

    try {
      branches = await getBranches();
    } catch (error) {
      await waitAfterError(
        `Failed to read branches: ${error.message}`,
      );

      continue;
    }

    const selected = await chooseBranch(branches);

    if (selected === 'exit') {
      return;
    }

    if (selected === 'refresh') {
      await fetch();
      continue;
    }

    // Selecting the current branch exits without invoking Git.
    if (selected.current) {
      return;
    }

    try {
      await checkout(selected, branches);
      return;
    } catch (error) {
      await waitAfterError(
        `Checkout failed: ${error.message}`,
      );
    }
  }
}

main().catch(error => {
  // Ctrl-C from an Inquirer prompt raises ExitPromptError.
  // Treat it as a normal exit instead of printing a stack trace.
  if (error?.name === 'ExitPromptError') {
    process.exit(0);
  }

  console.error(error.message);
  process.exit(1);
});
