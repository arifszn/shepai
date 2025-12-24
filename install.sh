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
    VERSION=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    
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
    
    DOWNLOAD_URL="https://github.com/$REPO/releases/download/$VERSION/shepai-$PLATFORM"
    
    echo -e "${YELLOW}Downloading shepai $VERSION for $PLATFORM...${NC}"
    
    # Create temp file
    TEMP_FILE=$(mktemp)
    
    # Download
    if ! curl -fsSL "$DOWNLOAD_URL" -o "$TEMP_FILE"; then
        echo -e "${RED}Error: Failed to download binary${NC}"
        rm -f "$TEMP_FILE"
        exit 1
    fi
    
    # Make executable
    chmod +x "$TEMP_FILE"
    
    # Verify it's a valid binary
    if ! file "$TEMP_FILE" | grep -q "executable"; then
        echo -e "${RED}Error: Downloaded file is not a valid executable${NC}"
        rm -f "$TEMP_FILE"
        exit 1
    fi
    
    # Install to /usr/local/bin (requires sudo)
    echo -e "${YELLOW}Installing to $INSTALL_DIR (requires sudo)...${NC}"
    if sudo mv "$TEMP_FILE" "$INSTALL_DIR/$BINARY_NAME"; then
        echo -e "${GREEN}✓ Successfully installed shepai to $INSTALL_DIR/$BINARY_NAME${NC}"
    else
        echo -e "${RED}Error: Failed to install binary${NC}"
        rm -f "$TEMP_FILE"
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

