#!/usr/bin/env node
// gfmp (Git Fetch, default-branch checkout, Pull): updates the repo's default
// branch (whatever origin/HEAD points to - "master" or "main") and prunes
// local branches whose upstream is gone.
//
// Usage:
//   gfmp

import {
  isGitRepo,
  getDefaultBranch,
  getCurrentBranch,
  fetchPrune,
  checkout,
  pruneGoneBranches,
  pull,
} from '../lib/git.mjs';

if (!isGitRepo()) {
  console.error('Current directory is not a Git repository!');
  process.exit(1);
}

const defaultBranch = getDefaultBranch();
if (!defaultBranch) {
  console.error('Could not determine the default branch (origin/HEAD)!');
  process.exit(1);
}

if (getCurrentBranch() === defaultBranch) {
  console.log(`Current branch is already ${defaultBranch}.`);
} else {
  console.log(`Checking out to ${defaultBranch}...`);
  try {
    checkout(defaultBranch);
  } catch {
    console.error(`Failed to checkout to ${defaultBranch}!`);
    process.exit(1);
  }
  console.log(`Successfully checked out to ${defaultBranch}.`);
}

console.log('Starting git fetch...');
try {
  fetchPrune();
} catch {
  console.error('git fetch failed!');
  process.exit(1);
}
console.log('git fetch completed.');

console.log('Starting to clean up local branches removed from remote...');
const deleted = pruneGoneBranches();
for (const branch of deleted) console.log(`Deleted local branch '${branch}'.`);
console.log('Cleanup completed.');

console.log(`Starting git pull to sync remote ${defaultBranch}...`);
try {
  pull();
} catch {
  console.error('git pull failed!');
  process.exit(1);
}
console.log('git pull completed.');
