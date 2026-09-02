import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export function getLogDir() {
  const dir = process.env.CUSTOM_WIN_CMD_LOG_DIR || join(homedir(), '.custom-win-cmd', 'logs');
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function getLogFile(name) {
  return join(getLogDir(), name);
}
