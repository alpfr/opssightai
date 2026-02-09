#!/bin/bash

# AI Compliance Platform - Installation Script
# Automated installation for release package

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 AI Compliance Platform - Installation${NC}"
echo "========================================"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.8+ is required but not installed"
    exit 1
fi
echo "✅ Python 3 found"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 16+ is required but not installed"
    exit 1
fi
echo "✅ Node.js found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed"
    exit 1
fi
echo "✅ npm found"

echo ""

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..

# Make scripts executable
echo -e "${YELLOW}Setting up management scripts...${NC}"
chmod +x *.sh

# Setup continuous operation
echo -e "${YELLOW}Setting up continuous operation...${NC}"
./setup-continuous-operation.sh

echo ""
echo -e "${GREEN}✅ Installation completed successfully!${NC}"
echo ""
echo "Your AI Compliance Platform is now ready to use:"
echo "  Frontend: http://localhost:3001"
echo "  Backend:  http://localhost:8000"
echo "  Login:    admin/admin123"
echo ""
echo "Management commands:"
echo "  ./platform-manager.sh    - Interactive management"
echo "  ./health-check.sh        - Health check"
echo "  ./keep-alive.sh monitor  - Continuous monitoring"
