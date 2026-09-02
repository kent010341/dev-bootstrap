# CLI Utils

A small collection of useful CLI utilities.

## Install

### Windows

Run [`setup.ps1`](setup.ps1) from the `cli-utils` directory using PowerShell:

```powershell
PS > cd cli-utils
PS > .\setup.ps1
```

Or simply run [`setup.ps1`](setup.ps1) from File Explorer.

### macOS / Linux

Run [`setup.sh`](setup.sh) from the `cli-utils` directory:

```bash
cd cli-utils
./setup.sh
```

## Commands

### `gfmp`

Switch to the repository's default branch (`main`, `master`, etc.), sync it with the remote, and clean up local branches whose upstream branches have been removed.

```text
gfmp
```

### `killp`

Force-kill a process by PID.

Especially useful on Windows, where the equivalent `taskkill` command is relatively verbose.
On macOS and Linux, it is equivalent to `kill -9 <PID>`.

```text
killp <PID>
```

### `port-usage`

Show the process listening on a TCP port, with an option to kill it.

```text
port-usage <port> [--kill]
```

### `uuid`

Generate a UUID and copy it to the clipboard.

Supports UUID versions 1, 4, 6, 7, and 8.

```text
uuid [-v <1|4|6|7|8>] [-u] [-n] [-p]
```

Options:

- `-v, --version` — UUID version to generate (default: `4`)
- `-u, --upper` — Use uppercase hexadecimal letters
- `-n, --no-dash` — Remove hyphens from the UUID
- `-p, --print-only` — Print the UUID without copying it to the clipboard
