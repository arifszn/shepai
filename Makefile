.PHONY: build frontend clean install dist

# Go build configuration (smaller binaries)
CGO_ENABLED ?= 0
GOFLAGS ?= -trimpath
LDFLAGS ?= -s -w -buildid=

# Build the frontend
frontend:
	cd frontend && npm install
	cd frontend && npm run build

# Build the Go binary (requires frontend to be built first)
build: frontend
	CGO_ENABLED=$(CGO_ENABLED) go build $(GOFLAGS) -ldflags="$(LDFLAGS)" -o shepai ./cmd/shepai

# Package compressed release artifacts to reduce download size
# Produces:
# - dist/shepai-<GOOS>-<GOARCH>.tar.gz  (contains ./shepai or ./shepai.exe)
# - dist/shepai-<GOOS>-<GOARCH>.zip
dist: build
	@mkdir -p dist
	@rm -f dist/shepai-* dist/*.tar.gz dist/*.zip
	@echo "Packaging dist artifacts..."
	@GOOS=darwin GOARCH=amd64 CGO_ENABLED=$(CGO_ENABLED) go build $(GOFLAGS) -ldflags="$(LDFLAGS)" -o dist/shepai-darwin-amd64 ./cmd/shepai
	@GOOS=darwin GOARCH=arm64 CGO_ENABLED=$(CGO_ENABLED) go build $(GOFLAGS) -ldflags="$(LDFLAGS)" -o dist/shepai-darwin-arm64 ./cmd/shepai
	@GOOS=linux GOARCH=amd64 CGO_ENABLED=$(CGO_ENABLED) go build $(GOFLAGS) -ldflags="$(LDFLAGS)" -o dist/shepai-linux-amd64 ./cmd/shepai
	@GOOS=linux GOARCH=arm64 CGO_ENABLED=$(CGO_ENABLED) go build $(GOFLAGS) -ldflags="$(LDFLAGS)" -o dist/shepai-linux-arm64 ./cmd/shepai
	@GOOS=windows GOARCH=amd64 CGO_ENABLED=$(CGO_ENABLED) go build $(GOFLAGS) -ldflags="$(LDFLAGS)" -o dist/shepai.exe ./cmd/shepai
	@cd dist && tar -czf shepai-darwin-amd64.tar.gz shepai-darwin-amd64
	@cd dist && tar -czf shepai-darwin-arm64.tar.gz shepai-darwin-arm64
	@cd dist && tar -czf shepai-linux-amd64.tar.gz shepai-linux-amd64
	@cd dist && tar -czf shepai-linux-arm64.tar.gz shepai-linux-arm64
	@cd dist && tar -czf shepai-windows-amd64.tar.gz shepai.exe
	@cd dist && zip -q shepai-darwin-amd64.zip shepai-darwin-amd64
	@cd dist && zip -q shepai-darwin-arm64.zip shepai-darwin-arm64
	@cd dist && zip -q shepai-linux-amd64.zip shepai-linux-amd64
	@cd dist && zip -q shepai-linux-arm64.zip shepai-linux-arm64
	@cd dist && zip -q shepai-windows-amd64.zip shepai.exe
	@echo "Done. Artifacts in ./dist"

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

