# Unwindows Pack

A small collection of scripts and CLI utilities that make Windows feel a little less Windows.

## Install

Run [`setup.ps1`](setup.ps1) from the `unwindows` directory using PowerShell:

```powershell
PS > cd unwindows
PS > .\setup.ps1
```

or simply run [`setup.ps1`](setup.ps1) from File Explorer.

## What It Does?

### Adds Common Bash CLI Commands

Installs and links commonly used CLI utilities that are missing or inconvenient on Windows, including:

- `grep`
- `nc`
- `pwd`

### Fixes PowerShell Command Behavior

Updates your PowerShell profile to make common commands behave more like their Bash counterparts:

- `curl` -> native `curl.exe`
- `where` -> native `where.exe`
- `pwd` -> prints only the current directory path
- `which` -> alias for `where.exe`
- `open` -> alias for `explorer.exe`
- `Ctrl+K` -> clears the console (macOS behavior)

The managed PowerShell profile configuration is automatically installed and updated by [`setup.ps1`](setup.ps1).
