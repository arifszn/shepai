# shepai

**shepai** is a config, real‑time log viewer that streams logs directly to your browser.

It supports both application log files and Docker container logs, runs entirely locally, and exposes a clean web dashboard at `http://localhost:4040`.

## Features

- Zero configuration for common dev workflows
- No dependency on application code changes
- No shelling out to system commands for log streaming
- Cross-platform support (macOS, Linux, Windows)
- Real-time log streaming via WebSocket
- Expandable multi-line log details (e.g. stack traces)
- Severity highlighting
- ANSI color support - Preserves colors from logs
- Automatic reconnection when containers restart or files are deleted/recreated

## Getting Started

### Install

#### macOS & Linux

```bash
curl -fsSL https://raw.githubusercontent.com/arifszn/shepai/main/install.sh | bash
```

#### Windows

1. Download the `shepai-windows-amd64.zip` asset from the [latest release](https://github.com/arifszn/shepai/releases/latest)
2. Extract it, open a terminal in the extracted directory

### Verify Installation

```powershell
# macOS/Linux
shepai --version

# Windows
.\shepai.exe --version
```

### Usage

#### File Logs

```bash
shepai file storage/logs/laravel.log
```

#### Docker Container Logs

```bash
shepai docker my_container
```

### Options

- `--port <number>` — Port for the web dashboard (default: 4040)

```bash
shepai docker my_container --port 8080
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development setup and guidelines.

## License

[MIT](LICENSE)
