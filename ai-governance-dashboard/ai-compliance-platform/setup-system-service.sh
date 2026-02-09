#!/bin/bash

# AI Compliance Platform - System Service Setup
# This script sets up the platform to run automatically on system startup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the current directory (full path)
CURRENT_DIR=$(pwd)
PLIST_FILE="com.ai-compliance-platform.plist"
LAUNCHD_DIR="$HOME/Library/LaunchAgents"

echo -e "${BLUE}=== AI Compliance Platform System Service Setup ===${NC}"
echo ""

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$LAUNCHD_DIR"

# Replace placeholders in plist file
echo -e "${YELLOW}Configuring system service...${NC}"
sed "s|REPLACE_WITH_FULL_PATH|$CURRENT_DIR|g" "$PLIST_FILE" > "$LAUNCHD_DIR/$PLIST_FILE"

# Load the service
echo -e "${YELLOW}Loading system service...${NC}"
launchctl unload "$LAUNCHD_DIR/$PLIST_FILE" 2>/dev/null || true  # Unload if already loaded
launchctl load "$LAUNCHD_DIR/$PLIST_FILE"

echo -e "${GREEN}✅ System service configured successfully!${NC}"
echo ""
echo "The AI Compliance Platform will now:"
echo "  • Start automatically when you log in"
echo "  • Restart automatically if it crashes"
echo "  • Keep running in the background"
echo ""
echo "Service management commands:"
echo "  Start:   launchctl start com.ai-compliance-platform"
echo "  Stop:    launchctl stop com.ai-compliance-platform"
echo "  Unload:  launchctl unload $LAUNCHD_DIR/$PLIST_FILE"
echo ""
echo -e "${BLUE}URLs:${NC}"
echo "  Frontend: http://localhost:3001"
echo "  Backend:  http://localhost:8000"
echo "  Login:    admin/admin123"
echo ""
echo -e "${YELLOW}Note: The service will start automatically in a few seconds...${NC}"