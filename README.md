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
- Search and filter capabilities
- Severity highlighting
- Pause/resume functionality
- Auto-scroll toggle

## Installation

### Prerequisites

- Go 1.21 or later
- Node.js 18+ and npm (for building frontend)
- Docker (optional, for Docker log streaming)

### Build from Source

```bash
# Clone the repository
git clone https://github.com/arifszn/shepai.git
cd shepai

# Build everything
make all

# Or build step by step
make install    # Install dependencies
make frontend   # Build frontend
make build      # Build Go binary
```

The binary will be created as `./shepai` in the project root.

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

## Architecture

High-level flow:

```
Log Source
   ↓
Collector (file/docker)
   ↓
Normalizer
   ↓
In-memory buffer
   ↓
WebSocket broadcaster
   ↓
Browser UI
```

## Security

- Binds only to `127.0.0.1` (localhost only)
- No authentication required (local use only)
- No outbound network calls
- No log shipping or persistence

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development setup and guidelines.

## License

See [LICENSE](LICENSE) file for details.
