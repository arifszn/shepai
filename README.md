<br/>

<p align="center">
  <img src="https://github.com/user-attachments/assets/5694fd48-1897-4ce1-9c63-6720aac57fc7" width="5%">
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

**shepai (সেপাই)** is a zero-config, real‑time log viewer with JSON support that streams logs directly to your browser.

It supports both application log files and Docker container logs, runs entirely locally, and exposes a clean web dashboard at `http://localhost:4040`.

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/f2a24c49-acb4-4ac5-9cc3-050ceaa51f06" />

## Motivation

I built **shepai** because I genuinely dislike debugging logs in the terminal.

Modern application logs are no longer simple strings — they’re often deeply nested JSON, long stack traces, or structured logs that wrap across multiple lines. In a terminal, this quickly becomes painful.

I wanted a way to **see logs the way they deserve to be seen** — structured, searchable, expandable, and persistent on screen — without introducing heavy log infrastructure or changing application code.

**shepai** is the result: a local, zero-config log viewer that turns raw logs into something you can actually reason about.

## Features

- Zero configuration for common dev workflows
- Real-time log streaming
- JSON viewer with syntax highlighting and collapsible structure
- Expandable stack traces viewer
- Severity highlighting with color-coded log levels
- Log Severity Filtering - Filter logs by level (Error, Warning, Info, Debug, etc.)
- Focus Mode - Click a log entry to focus on it while blurring others
- powerful Search - Real-time text filtering and highlighting
- Zoom Controls - Adjust text size for better readability
- Dark/Light Mode - Toggle between themes
- ANSI color support - Preserves colors from logs
- Automatic reconnection when containers restart or files are deleted/recreated
- No dependency on application code changes
- No shelling out to system commands for log streaming
- Cross-platform support (macOS, Linux, Windows)

https://github.com/user-attachments/assets/9118aa6b-5d5c-41bc-80e4-ae1b064e09a2

## Getting Started

### Installation

Choose the installation method for your operating system:

#### macOS & Linux

Run the automated installation script:

```bash
curl -fsSL https://raw.githubusercontent.com/arifszn/shepai/main/install.sh | bash
```

**Verify the installation:**

```bash
shepai --version
```

---

#### Windows

##### Option 1: PowerShell Script (Recommended)

Run the automated installation script in PowerShell:

```powershell
irm https://raw.githubusercontent.com/arifszn/shepai/main/install.ps1 | iex
```

**Verify the installation** (restart your terminal first):

```powershell
shepai --version
```

##### Option 2: Manual Installation

If you prefer to install manually:

1. Download the `shepai-windows-amd64.zip` asset from the [**latest release**](https://github.com/arifszn/shepai/releases/latest)
2. Extract the archive to your preferred location
3. Open a terminal in the extracted directory

**Verify the installation:**

```powershell
.\shepai.exe --version
```

> **Note for Option 2:** For system-wide access, add the extracted directory to your PATH environment variable.

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
