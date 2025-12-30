#!/bin/bash

# EARS-Workflow Skill Package Installation Script
# 
# Cross-platform wrapper that calls the JavaScript installation script

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Run the JavaScript installation script
exec node "$SCRIPT_DIR/install.js" "$@"