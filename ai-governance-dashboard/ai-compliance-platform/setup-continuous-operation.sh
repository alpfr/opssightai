#!/bin/bash

# AI Compliance Platform - One-Click Continuous Operation Setup
# This script sets up everything needed for continuous operation

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 AI Compliance Platform - Continuous Operation Setup${NC}"
echo "========================================================"
echo ""

# Step 1: Make all scripts executable
echo -e "${YELLOW}1. Making scripts executable...${NC}"
chmod +x keep-alive.sh
chmod +x platform-manager.sh  
chmod +x health-check.sh
chmod +x setup-system-service.sh

# Step 2: Check current status
echo -e "${YELLOW}2. Checking current status...${NC}"
./health-check.sh

# Step 3: Setup system service (optional)
echo ""
echo -e "${YELLOW}3. System Service Setup${NC}"
read -p "Do you want to setup auto-start on login? (y/n): " setup_service

if [[ $setup_service =~ ^[Yy]$ ]]; then
    ./setup-system-service.sh
else
    echo "Skipping system service setup"
fi

# Step 4: Start monitoring (optional)
echo ""
echo -e "${YELLOW}4. Continuous Monitoring${NC}"
read -p "Do you want to start continuous monitoring now? (y/n): " start_monitoring

if [[ $start_monitoring =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Starting continuous monitoring...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop monitoring and return to terminal${NC}"
    echo ""
    ./keep-alive.sh monitor
else
    echo ""
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
    echo "Your AI Compliance Platform is now running continuously!"
    echo ""
    echo "Management commands:"
    echo "  ./platform-manager.sh    - Interactive management interface"
    echo "  ./keep-alive.sh monitor  - Start continuous monitoring"
    echo "  ./health-check.sh        - Quick health check"
    echo ""
    echo "Access your platform:"
    echo "  Frontend: http://localhost:3001"
    echo "  Login:    admin/admin123"
fi