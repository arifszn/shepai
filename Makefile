.PHONY: build frontend clean install

# Build the frontend
frontend:
	cd frontend && npm install
	cd frontend && npm run build

# Build the Go binary (requires frontend to be built first)
build: frontend
	go build -o shepai ./cmd/shepai

# Install dependencies
install:
	cd frontend && npm install
	go mod download

# Clean build artifacts
clean:
	rm -rf frontend/node_modules
	rm -rf frontend/dist
	rm -rf internal/server/static
	rm -f shepai

# Full build from scratch
all: clean install build

