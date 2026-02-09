#!/bin/bash

# AI Compliance Platform - Management Dashboard
# Interactive management interface for the platform

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
BACKEND_PORT=8000
FRONTEND_PORT=3001

# Function to check service status
check_service() {
    local port=$1
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to show main menu
show_menu() {
    clear
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║              AI COMPLIANCE PLATFORM MANAGER                  ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Show current status
    echo -e "${CYAN}Current Status:${NC}"
    if check_service $BACKEND_PORT; then
        echo -e "  Backend (port $BACKEND_PORT):  ${GREEN}●${NC} RUNNING"
    else
        echo -e "  Backend (port $BACKEND_PORT):  ${RED}●${NC} STOPPED"
    fi
    
    if check_service $FRONTEND_PORT; then
        echo -e "  Frontend (port $FRONTEND_PORT): ${GREEN}●${NC} RUNNING"
    else
        echo -e "  Frontend (port $FRONTEND_PORT): ${RED}●${NC} STOPPED"
    fi
    
    echo ""
    echo -e "${CYAN}Quick Access:${NC}"
    echo "  Frontend: http://localhost:$FRONTEND_PORT"
    echo "  Backend:  http://localhost:$BACKEND_PORT"
    echo "  Login:    admin/admin123"
    echo ""
    
    echo -e "${YELLOW}Management Options:${NC}"
    echo "  1) Start Services"
    echo "  2) Stop Services"
    echo "  3) Restart Services"
    echo "  4) Monitor Services (Keep Alive)"
    echo "  5) View Logs"
    echo "  6) Setup System Service (Auto-start)"
    echo "  7) Open Frontend in Browser"
    echo "  8) Test API Connection"
    echo "  9) Exit"
    echo ""
}

# Main interactive loop
while true; do
    show_menu
    read -p "Select option (1-9): " choice
    
    case $choice in
        1)
            echo -e "${YELLOW}Starting services...${NC}"
            ./keep-alive.sh start
            read -p "Press Enter to continue..."
            ;;
        2)
            echo -e "${YELLOW}Stopping services...${NC}"
            ./keep-alive.sh stop
            read -p "Press Enter to continue..."
            ;;
        3)
            echo -e "${YELLOW}Restarting services...${NC}"
            ./keep-alive.sh restart
            read -p "Press Enter to continue..."
            ;;
        4)
            echo -e "${GREEN}Starting continuous monitoring...${NC}"
            echo -e "${YELLOW}Press Ctrl+C to return to menu${NC}"
            ./keep-alive.sh monitor
            ;;
        5)
            ./keep-alive.sh logs
            read -p "Press Enter to continue..."
            ;;
        6)
            echo -e "${YELLOW}Setting up system service...${NC}"
            ./setup-system-service.sh
            read -p "Press Enter to continue..."
            ;;
        7)
            echo -e "${YELLOW}Opening frontend in browser...${NC}"
            open "http://localhost:$FRONTEND_PORT" 2>/dev/null || \
            echo "Please open http://localhost:$FRONTEND_PORT in your browser"
            read -p "Press Enter to continue..."
            ;;
        8)
            echo -e "${YELLOW}Testing API connection...${NC}"
            if check_service $BACKEND_PORT; then
                echo -e "${GREEN}✅ Backend API is responding${NC}"
            else
                echo -e "${RED}❌ Backend API is not responding${NC}"
            fi
            if check_service $FRONTEND_PORT; then
                echo -e "${GREEN}✅ Frontend is responding${NC}"
            else
                echo -e "${RED}❌ Frontend is not responding${NC}"
            fi
            read -p "Press Enter to continue..."
            ;;
        9)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            sleep 2
            ;;
    esac
done