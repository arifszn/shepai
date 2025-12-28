#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BINARY_NAME="shepai"
INSTALL_DIR="/usr/local/bin"
BINARY_PATH="$INSTALL_DIR/$BINARY_NAME"

# Uninstall function
uninstall() {
    echo -e "${YELLOW}Uninstalling shepai...${NC}"

    # Check if shepai is installed
    if [ ! -f "$BINARY_PATH" ]; then
        echo -e "${YELLOW}Warning: shepai not found at $BINARY_PATH${NC}"
        echo -e "${YELLOW}shepai may not be installed or was installed to a different location${NC}"

        # Check if it exists in PATH
        if command -v "$BINARY_NAME" >/dev/null 2>&1; then
            FOUND_PATH=$(which "$BINARY_NAME")
            echo -e "${YELLOW}Found shepai at: $FOUND_PATH${NC}"

            # Ask user if they want to remove this instead
            read -p "Do you want to remove this installation? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                BINARY_PATH="$FOUND_PATH"
            else
                echo -e "${YELLOW}Uninstallation cancelled${NC}"
                exit 0
            fi
        else
            echo -e "${GREEN}shepai does not appear to be installed${NC}"
            exit 0
        fi
    fi

    # Remove binary (requires sudo if in /usr/local/bin)
    if [ -w "$(dirname "$BINARY_PATH")" ]; then
        # Directory is writable, no sudo needed
        echo -e "${YELLOW}Removing $BINARY_PATH...${NC}"
        rm -f "$BINARY_PATH"
    else
        # Directory requires elevated permissions
        echo -e "${YELLOW}Removing $BINARY_PATH (requires sudo)...${NC}"
        if sudo rm -f "$BINARY_PATH"; then
            echo -e "${GREEN}✓ Successfully removed shepai from $BINARY_PATH${NC}"
        else
            echo -e "${RED}Error: Failed to remove binary${NC}"
            exit 1
        fi
    fi

    # Verify removal
    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        echo -e "${YELLOW}Warning: shepai is still found in PATH${NC}"
        echo -e "${YELLOW}Location: $(which "$BINARY_NAME")${NC}"
        echo -e "${YELLOW}You may have multiple installations${NC}"
    else
        echo -e "${GREEN}✓ Uninstallation complete!${NC}"
        echo -e "${GREEN}shepai has been removed from your system${NC}"
    fi
}

# Main
main() {
    echo -e "${GREEN}Starting shepai uninstallation...${NC}"
    uninstall
}

main "$@"
