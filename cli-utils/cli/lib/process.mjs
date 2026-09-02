import findProcess from 'find-process';

/**
 * Lists processes with a TCP listener on the given port, cross-platform
 * (find-process shells out to the right native tool per OS internally).
 */
export async function findByPort(port) {
  return findProcess('port', port);
}

export async function findByName(name) {
  return findProcess('name', name, true);
}

/**
 * Kills a process using Node's built-in process.kill, which libuv maps to
 * TerminateProcess on Windows and a real signal elsewhere - no need to shell
 * out to taskkill/kill.
 */
export function killPid(pid) {
  try {
    process.kill(pid, 'SIGKILL');
    return { ok: true };
  } catch (err) {
    if (err.code === 'ESRCH') {
      return { ok: false, reason: `No process with PID ${pid}.` };
    }
    if (err.code === 'EPERM') {
      return { ok: false, reason: `Permission denied killing PID ${pid}. Try running with elevated privileges.` };
    }
    return { ok: false, reason: err.message };
  }
}
