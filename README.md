# dev-bootstrap

Scripts to bootstrap and configure a development environment.

## Contents

| Directory | Description |
| --- | --- |
| [`cli-utils`](cli-utils/README.md) | Handy CLI commands: `gfmp`, `killp`, `port-usage`, `uuid`, `checkout`. |
| [`unwindows`](unwindows/README.md) | Makes Windows feel more like Bash: `grep`, `nc`, `pwd`, PowerShell profile tweaks, hosts shortcuts. |
| [`git`](git) | Git alias setup scripts (`aliases.ps1`, `aliases.sh`). |

## Quick Start

Requires [Node.js](https://nodejs.org/). On Windows, run the setup script from PowerShell:

```powershell
PS > .\cli-utils\setup.ps1
PS > .\unwindows\setup.ps1
```

See each directory's README for details.

## License

See [LICENSE](LICENSE).
