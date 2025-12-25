# Contributing to shepai

Thank you for your interest in contributing to shepai!

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/arifszn/shepai.git
   cd shepai
   ```

2. **Install dependencies:**
   ```bash
   make install
   ```

3. **Build the project:**
   ```bash
   make all
   ```

## Project Structure

```
shepai/
├── cmd/            # CLI entry point
├── internal/       # Core backend logic (CLI, collectors, server)
├── frontend/       # React frontend (log viewer UI)
├── Makefile        # Build automation
└── go.mod          # Go dependencies
```

## Development Workflow

### Frontend Development

For frontend development with hot reload:

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` (Vite default).

### Backend Development

Run the Go server directly:

```bash
go run ./cmd/shepai file test.log
```

### Building

Build everything:

```bash
make all
```

Or step by step:

```bash
make frontend  # Build frontend
make build     # Build Go binary
```

## Build Process

1. **Frontend Build**
   - `npm install` → Install dependencies
   - `npm run build` → Build with Vite
   - Outputs to `internal/server/static/`

2. **Backend Build**
   - `go build` → Compiles Go binary
   - Embeds `internal/server/static/` using `embed.FS`
   - Single binary output: `./shepai`

## Data Flow

```
User Command
    ↓
CLI Handler
    ↓
Collector (File/Docker)
    ↓
LogEvent Normalization
    ↓
Event Channel
    ↓
WebSocket Broadcaster
    ↓
Browser UI
```

## Code Style

- **Go**: Follow `gofmt` and standard Go conventions
- **TypeScript/React**: Follow ESLint rules and Prettier formatting
- Use meaningful commit messages
- Keep comments concise and focused on "why" not "what"

## Testing

Before submitting a PR, please:

1. Build the project successfully (`make all`)
2. Test file log streaming:
   ```bash
   ./shepai file test.log
   ```
3. Test Docker log streaming (if Docker is available):
   ```bash
   ./shepai docker <container_name_or_id>
   ```
4. Verify the UI works correctly at `http://localhost:4040`
5. Test port auto-incrementing (start multiple instances)

## Quick Start Examples

### Testing with a Sample Log File

Create a test log file:

```bash
echo "2025-01-01 12:00:00 [INFO] Application started
2025-01-01 12:00:01 [WARNING] Low memory detected
2025-01-01 12:00:02 [ERROR] Failed to connect to database" > test.log
```

Then run:

```bash
./shepai file test.log
```

### Testing with Docker

If you have a running container:

```bash
# List running containers
docker ps

# Stream logs from a container (name, full ID, or short ID)
./shepai docker my-container
./shepai docker abc123def456
./shepai docker abc123
```

## Troubleshooting

### Frontend not loading

If you see "Frontend not built" message:

```bash
cd frontend
npm install
npm run build
cd ..
make build
```

### Docker connection errors

- Ensure Docker is running: `docker ps`
- Verify container exists: `docker ps -a`
- Check Docker socket permissions (Linux)

### Port already in use

The server automatically increments the port if the preferred port is occupied. You can also manually specify a port:

```bash
./shepai file log.log --port 8080
```

## Submitting Changes

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request with a clear description

## Questions?

Open an issue for any questions or discussions.
