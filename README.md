# shepai

**shepai** is a local developer tool that provides a browser-based log viewer for two common log sources:

1. **File-based application logs** (e.g. Laravel `storage/logs/*.log`)
2. **Docker container logs** (via Docker Engine API)

The tool runs locally, streams logs in real time, and exposes a dashboard at `http://localhost:4040`.

## Features

- Zero configuration for common dev workflows
- No dependency on application code changes
- No shelling out to system commands for log streaming
- Cross-platform support (macOS, Linux, Windows)
- Simple, inspectable architecture
- Real-time log streaming via WebSocket
- Search and filter capabilities with highlighted results
- Severity highlighting
- **ANSI color support** - Preserves colors from Docker container logs
- **Automatic Docker reconnection** - Automatically reconnects when containers restart
- Pause/resume functionality
- Auto-scroll toggle
- Clear all logs functionality

## Installation

### macOS & Linux

```bash
curl -fsSL https://raw.githubusercontent.com/arifszn/shepai/main/install.sh | bash
```

### Windows

1. Download `shepai.exe` from the [latest release](https://github.com/arifszn/shepai/releases/latest)
2. Run it directly from the download folder

```powershell
.\shepai.exe file storage\logs\laravel.log
```

#### Verify installation

```bash
# macOS/Linux
shepai --version

# Windows
.\shepai.exe --version
```

Want to build from source? See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

## Usage

### File Logs

Stream logs from a file:

```bash
shepai file storage/logs/laravel.log
```

### Docker Container Logs

Stream logs from a Docker container:

```bash
shepai docker my_container
```

### Flags

- `--port <number>` - Port for web dashboard (default: 4040)

### Examples

```bash
# Stream Laravel logs
shepai file storage/logs/laravel.log

# Stream Docker container logs on custom port
shepai docker my_container --port 8080
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development setup and guidelines.

## License

See [LICENSE](LICENSE) file for details.
