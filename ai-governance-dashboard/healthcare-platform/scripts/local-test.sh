#!/bin/bash

# Vantedge Health - Local Docker Testing Script
# Test the production Docker build locally before deploying

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Vantedge Health Local Docker Test ===${NC}"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found${NC}"
    echo "Please create .env.production with your configuration"
    exit 1
fi

echo -e "${YELLOW}Step 1: Building Docker image...${NC}"
docker build -t vantedge-health:test .

echo -e "${YELLOW}Step 2: Starting container with docker-compose...${NC}"
docker-compose up -d

echo -e "${YELLOW}Step 3: Waiting for application to start...${NC}"
sleep 10

echo -e "${YELLOW}Step 4: Running health check...${NC}"
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Health check passed!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Health check failed after 30 attempts${NC}"
        docker-compose logs
        exit 1
    fi
    echo "Waiting for application... ($i/30)"
    sleep 2
done

echo ""
echo -e "${GREEN}=== Application is running! ===${NC}"
echo ""
echo "Access the application at: http://localhost:3000"
echo ""
echo "Available pages:"
echo "  - Home: http://localhost:3000/home"
echo "  - Features: http://localhost:3000/features"
echo "  - Pricing: http://localhost:3000/pricing"
echo "  - Contact: http://localhost:3000/contact"
echo "  - About: http://localhost:3000/about"
echo "  - Dashboard: http://localhost:3000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
