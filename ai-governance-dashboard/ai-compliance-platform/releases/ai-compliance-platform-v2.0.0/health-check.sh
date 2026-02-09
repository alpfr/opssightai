#!/bin/bash

# AI Compliance Platform - Health Check Script
# Quick health check for both services

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_PORT=8000
FRONTEND_PORT=3001

echo "AI Compliance Platform Health Check"
echo "=================================="

# Check backend
echo -n "Backend (port $BACKEND_PORT): "
if curl -s "http://localhost:$BACKEND_PORT" > /dev/null 2>&1; then
    echo -e "${GREEN}HEALTHY${NC}"
    BACKEND_OK=1
else
    echo -e "${RED}DOWN${NC}"
    BACKEND_OK=0
fi

# Check frontend
echo -n "Frontend (port $FRONTEND_PORT): "
if curl -s "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
    echo -e "${GREEN}HEALTHY${NC}"
    FRONTEND_OK=1
else
    echo -e "${RED}DOWN${NC}"
    FRONTEND_OK=0
fi

echo ""
if [ $BACKEND_OK -eq 1 ] && [ $FRONTEND_OK -eq 1 ]; then
    echo -e "${GREEN}✅ All services are running properly${NC}"
    echo ""
    echo "Access URLs:"
    echo "  Frontend: http://localhost:$FRONTEND_PORT"
    echo "  Backend:  http://localhost:$BACKEND_PORT"
    echo "  Login:    admin/admin123"
    exit 0
else
    echo -e "${RED}❌ Some services are down${NC}"
    echo -e "${YELLOW}Run './keep-alive.sh start' to start services${NC}"
    exit 1
fi