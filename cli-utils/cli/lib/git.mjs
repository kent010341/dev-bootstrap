import { execFileSync } from 'node:child_process';

function git(args, options = {}) {
  const output = execFileSync('git', args, { encoding: 'utf8', ...options });
  return typeof output === 'string' ? output.trim() : output;
}

function tryGit(args) {
  try {
    return { ok: true, value: git(args) };
  } catch (err) {
    return { ok: false, value: '', error: err };
  }
}

export function isGitRepo() {
  return tryGit(['rev-parse', '--is-inside-work-tree']).ok;
}

export function getRemoteUrl() {
  const result = tryGit(['config', '--get', 'remote.origin.url']);
  return result.ok ? result.value : '';
}

export function getCurrentBranch() {
  const result = tryGit(['symbolic-ref', '--short', 'HEAD']);
  return result.ok ? result.value : '';
}

export function getDefaultBranch() {
  const result = tryGit(['rev-parse', '--abbrev-ref', 'origin/HEAD']);
  if (!result.ok) return '';
  return result.value.replace(/^origin\//, '');
}

export function localBranchExists(name) {
  return tryGit(['show-ref', '--verify', '-q', `refs/heads/${name}`]).ok;
}

export function remoteBranchExists(name) {
  return tryGit(['show-ref', '--verify', '-q', `refs/remotes/origin/${name}`]).ok;
}

export function fetchPrune() {
  git(['fetch', '--prune'], { stdio: 'inherit' });
}

export function checkout(name) {
  git(['checkout', name], { stdio: 'inherit' });
}

export function pull() {
  git(['pull'], { stdio: 'inherit' });
}

/**
 * Deletes local branches whose upstream is marked "[... : gone]" by `git branch -vv`.
 * Mirrors the logic previously duplicated in gfmp.bat and prune-branch.bat.
 */
export function pruneGoneBranches() {
  const output = tryGit(['branch', '-vv']);
  if (!output.ok) return [];

  const current = getCurrentBranch();
  const deleted = [];

  for (const line of output.value.split('\n')) {
    if (!/:\s*gone\]/.test(line)) continue;
    const name = line.replace(/^\*?\s*/, '').split(/\s+/)[0];
    if (!name || name === current) continue;
    try {
      git(['branch', '-D', name]);
      deleted.push(name);
    } catch {
      // best-effort cleanup; keep going with the remaining branches
    }
  }

  return deleted;
}
