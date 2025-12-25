<br/>

<p align="center">
  <img src="https://github.com/user-attachments/assets/36d6aac0-71d5-45cb-a933-9305f85de90c" width="5%">
  <h1 align="center">shepai</h1>
  <h4 align="center">A zero-config log viewer for files and Docker, streamed live in your browser.</h4>

  <p align="center">
    <a href="https://github.com/arifszn/shepai/actions/workflows/build.yml">
      <img src="https://github.com/arifszn/shepai/actions/workflows/build.yml/badge.svg"/>
    </a>
    <a href="https://github.com/arifszn/shepai/issues">
      <img src="https://img.shields.io/github/issues/arifszn/shepai"/>
    </a>
    <a href="https://github.com/arifszn/shepai/stargazers">
      <img src="https://img.shields.io/github/stars/arifszn/shepai"/>
    </a>
    <a href="https://github.com/arifszn/shepai/blob/main/CONTRIBUTING.md">
      <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat"/>
    </a>
    <a href="https://github.com/arifszn/shepai/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/arifszn/shepai"/>
    </a>
    <a href="https://twitter.com/intent/tweet?url=https://github.com/arifszn/shepai&hashtags=opensource,devtools,logs,docker,webdev">
      <img src="https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Farifszn%2Fshepai" />
    </a>
  </p>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/f02be2ba-c8ae-4a23-b0e9-99740fed3ac2" alt="Preview" width="50%"/>
</p>

**shepai** is a zero-config, real‑time log viewer that streams logs directly to your browser.

It supports both application log files and Docker container logs, runs entirely locally, and exposes a clean web dashboard at `http://localhost:4040`.

<img width="50%" alt="image" src="https://github.com/user-attachments/assets/22da3068-0dc3-4260-8eb5-b32978013c64" />

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
