#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# GitHub repository
REPO="arifszn/shepai"
BINARY_NAME="shepai"
INSTALL_DIR="/usr/local/bin"

# Detect OS and architecture
detect_platform() {
    OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
    ARCH="$(uname -m)"
    
    case "$ARCH" in
        x86_64)
            ARCH="amd64"
            ;;
        arm64|aarch64)
            ARCH="arm64"
            ;;
        *)
            echo -e "${RED}Error: Unsupported architecture: $ARCH${NC}"
            exit 1
            ;;
    esac
    
    case "$OS" in
        darwin)
            PLATFORM="darwin-$ARCH"
            ;;
        linux)
            PLATFORM="linux-$ARCH"
            ;;
        *)
            echo -e "${RED}Error: Unsupported OS: $OS${NC}"
            exit 1
            ;;
    esac
}

# Get latest version
get_latest_version() {
    echo -e "${YELLOW}Fetching latest version...${NC}"
    # Try getting version from redirect url (avoids API rate limits)
    VERSION=$(curl -Ls -o /dev/null -w %{url_effective} "https://github.com/$REPO/releases/latest" | sed 's:.*/::')
    
    if [ "$VERSION" = "latest" ]; then
      # Fallback to API if redirect method fails (e.g. no releases yet or private repo handling quirks)
      VERSION=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    fi
    
    if [ -z "$VERSION" ]; then
        echo -e "${RED}Error: Could not fetch latest version${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Latest version: $VERSION${NC}"
}

# Download and install
install() {
    detect_platform
    get_latest_version
    
    # Prefer compressed artifacts to reduce download size.
    # New release assets:
    # - shepai-$PLATFORM.tar.gz (contains a single file: shepai-$PLATFORM)
    # - shepai-$PLATFORM.zip
    # Fallback (older releases):
    # - shepai-$PLATFORM (raw binary)
    DOWNLOAD_URL_TGZ="https://github.com/$REPO/releases/download/$VERSION/shepai-$PLATFORM.tar.gz"
    DOWNLOAD_URL_ZIP="https://github.com/$REPO/releases/download/$VERSION/shepai-$PLATFORM.zip"
    DOWNLOAD_URL_RAW="https://github.com/$REPO/releases/download/$VERSION/shepai-$PLATFORM"
    
    echo -e "${YELLOW}Downloading shepai $VERSION for $PLATFORM...${NC}"
    
    # Create temp workspace
    TEMP_DIR=$(mktemp -d)
    TEMP_FILE="$TEMP_DIR/download"
    EXTRACT_DIR="$TEMP_DIR/extract"
    mkdir -p "$EXTRACT_DIR"
    
    cleanup() {
        rm -rf "$TEMP_DIR"
    }
    trap cleanup EXIT

    # Try tar.gz first (best compression), then zip, then raw binary (back-compat)
    DOWNLOADED_FORMAT=""
    if curl -fsSL "$DOWNLOAD_URL_TGZ" -o "$TEMP_FILE.tar.gz" 2>/dev/null; then
        DOWNLOADED_FORMAT="tar.gz"
    elif curl -fsSL "$DOWNLOAD_URL_ZIP" -o "$TEMP_FILE.zip" 2>/dev/null; then
        DOWNLOADED_FORMAT="zip"
    elif curl -fsSL "$DOWNLOAD_URL_RAW" -o "$TEMP_FILE" 2>/dev/null; then
        DOWNLOADED_FORMAT="raw"
    else
        echo -e "${RED}Error: Failed to download release asset${NC}"
        echo -e "${YELLOW}Tried:${NC}"
        echo -e "${YELLOW}  - $DOWNLOAD_URL_TGZ${NC}"
        echo -e "${YELLOW}  - $DOWNLOAD_URL_ZIP${NC}"
        echo -e "${YELLOW}  - $DOWNLOAD_URL_RAW${NC}"
        exit 1
    fi

    # Extract/locate binary
    BIN_PATH=""
    if [ "$DOWNLOADED_FORMAT" = "tar.gz" ]; then
        if ! tar -xzf "$TEMP_FILE.tar.gz" -C "$EXTRACT_DIR"; then
            echo -e "${RED}Error: Failed to extract tar.gz${NC}"
            exit 1
        fi
        BIN_PATH="$EXTRACT_DIR/shepai-$PLATFORM"
    elif [ "$DOWNLOADED_FORMAT" = "zip" ]; then
        if ! command -v unzip >/dev/null 2>&1; then
            echo -e "${RED}Error: 'unzip' is required to install from .zip releases${NC}"
            exit 1
        fi
        if ! unzip -q "$TEMP_FILE.zip" -d "$EXTRACT_DIR"; then
            echo -e "${RED}Error: Failed to extract zip${NC}"
            exit 1
        fi
        BIN_PATH="$EXTRACT_DIR/shepai-$PLATFORM"
    else
        BIN_PATH="$TEMP_FILE"
    fi
    
    # Make executable
    chmod +x "$BIN_PATH"
    
    # Verify it's a valid binary
    if ! file "$BIN_PATH" | grep -q "executable"; then
        echo -e "${RED}Error: Downloaded file is not a valid executable${NC}"
        exit 1
    fi
    
    # Install to /usr/local/bin (requires sudo)
    echo -e "${YELLOW}Installing to $INSTALL_DIR (requires sudo)...${NC}"
    if sudo mv "$BIN_PATH" "$INSTALL_DIR/$BINARY_NAME"; then
        echo -e "${GREEN}✓ Successfully installed shepai to $INSTALL_DIR/$BINARY_NAME${NC}"
    else
        echo -e "${RED}Error: Failed to install binary${NC}"
        exit 1
    fi
    
    # Verify installation
    if command -v "$BINARY_NAME" > /dev/null 2>&1; then
        INSTALLED_VERSION=$($BINARY_NAME --version 2>&1 || echo "unknown")
        echo -e "${GREEN}✓ Installation verified${NC}"
        echo -e "${GREEN}Run 'shepai --help' to get started${NC}"
    else
        echo -e "${YELLOW}Warning: Binary installed but not found in PATH${NC}"
        echo -e "${YELLOW}Make sure $INSTALL_DIR is in your PATH${NC}"
    fi
}

# Main
main() {
    echo -e "${GREEN}Installing shepai...${NC}"
    install
}

main "$@"

