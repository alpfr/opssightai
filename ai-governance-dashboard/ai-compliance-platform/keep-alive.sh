#!/bin/bash

# AI Compliance Platform - Keep Alive Script
# This script ensures both backend and frontend services stay running

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=8000
FRONTEND_PORT=3001
CHECK_INTERVAL=30  # seconds
MAX_RETRIES=3
LOG_FILE="keep-alive.log"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if a service is running on a port
check_service() {
    local port=$1
    local service_name=$2
    
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        return 0  # Service is running
    else
        return 1  # Service is not running
    fi
}

# Function to start backend
start_backend() {
    log_message "${BLUE}Starting backend service...${NC}"
    cd backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        log_message "${YELLOW}Creating virtual environment...${NC}"
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi
    
    # Start backend in background
    nohup python main.py > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    
    cd ..
    log_message "${GREEN}Backend started with PID: $BACKEND_PID${NC}"
}

# Function to start frontend
start_frontend() {
    log_message "${BLUE}Starting frontend service...${NC}"
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_message "${YELLOW}Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Start frontend in background
    PORT=$FRONTEND_PORT nohup npm start > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    cd ..
    log_message "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"
}

# Function to stop services
stop_services() {
    log_message "${YELLOW}Stopping services...${NC}"
    
    # Stop backend
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            log_message "Backend stopped (PID: $BACKEND_PID)"
        fi
        rm -f backend.pid
    fi
    
    # Stop frontend
    if [ -f "frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            log_message "Frontend stopped (PID: $FRONTEND_PID)"
        fi
        rm -f frontend.pid
    fi
    
    # Kill any remaining processes
    pkill -f "python main.py" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    pkill -f "react-scripts start" 2>/dev/null || true
}

# Function to check and restart services if needed
monitor_services() {
    local backend_retries=0
    local frontend_retries=0
    
    while true; do
        # Check backend
        if ! check_service $BACKEND_PORT "backend"; then
            backend_retries=$((backend_retries + 1))
            log_message "${RED}Backend not responding (attempt $backend_retries/$MAX_RETRIES)${NC}"
            
            if [ $backend_retries -le $MAX_RETRIES ]; then
                # Kill existing backend processes
                pkill -f "python main.py" 2>/dev/null || true
                sleep 5
                start_backend
                sleep 10  # Give it time to start
            else
                log_message "${RED}Backend failed to start after $MAX_RETRIES attempts${NC}"
                exit 1
            fi
        else
            if [ $backend_retries -gt 0 ]; then
                log_message "${GREEN}Backend is back online${NC}"
                backend_retries=0
            fi
        fi
        
        # Check frontend
        if ! check_service $FRONTEND_PORT "frontend"; then
            frontend_retries=$((frontend_retries + 1))
            log_message "${RED}Frontend not responding (attempt $frontend_retries/$MAX_RETRIES)${NC}"
            
            if [ $frontend_retries -le $MAX_RETRIES ]; then
                # Kill existing frontend processes
                pkill -f "npm start" 2>/dev/null || true
                pkill -f "react-scripts start" 2>/dev/null || true
                sleep 5
                start_frontend
                sleep 15  # Give it more time to compile
            else
                log_message "${RED}Frontend failed to start after $MAX_RETRIES attempts${NC}"
                exit 1
            fi
        else
            if [ $frontend_retries -gt 0 ]; then
                log_message "${GREEN}Frontend is back online${NC}"
                frontend_retries=0
            fi
        fi
        
        # Wait before next check
        sleep $CHECK_INTERVAL
    done
}

# Function to show status
show_status() {
    echo -e "${BLUE}=== AI Compliance Platform Status ===${NC}"
    
    if check_service $BACKEND_PORT "backend"; then
        echo -e "Backend (port $BACKEND_PORT): ${GREEN}RUNNING${NC}"
    else
        echo -e "Backend (port $BACKEND_PORT): ${RED}STOPPED${NC}"
    fi
    
    if check_service $FRONTEND_PORT "frontend"; then
        echo -e "Frontend (port $FRONTEND_PORT): ${GREEN}RUNNING${NC}"
    else
        echo -e "Frontend (port $FRONTEND_PORT): ${RED}STOPPED${NC}"
    fi
    
    echo ""
    echo "URLs:"
    echo "  Frontend: http://localhost:$FRONTEND_PORT"
    echo "  Backend API: http://localhost:$BACKEND_PORT"
    echo ""
    echo "Credentials: admin/admin123"
}

# Main script logic
case "${1:-start}" in
    "start")
        log_message "${GREEN}Starting AI Compliance Platform...${NC}"
        
        # Stop any existing services first
        stop_services
        sleep 2
        
        # Start services
        start_backend
        sleep 10  # Give backend time to start
        start_frontend
        sleep 15  # Give frontend time to compile
        
        # Show status
        show_status
        
        log_message "${GREEN}Services started successfully!${NC}"
        echo -e "${YELLOW}Run './keep-alive.sh monitor' to keep services running continuously${NC}"
        ;;
        
    "stop")
        stop_services
        log_message "${GREEN}All services stopped${NC}"
        ;;
        
    "restart")
        log_message "${YELLOW}Restarting services...${NC}"
        stop_services
        sleep 5
        $0 start
        ;;
        
    "status")
        show_status
        ;;
        
    "monitor")
        log_message "${GREEN}Starting continuous monitoring...${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop monitoring${NC}"
        
        # Trap Ctrl+C to clean shutdown
        trap 'log_message "Monitoring stopped by user"; exit 0' INT
        
        monitor_services
        ;;
        
    "logs")
        echo -e "${BLUE}=== Backend Logs ===${NC}"
        tail -20 backend.log 2>/dev/null || echo "No backend logs found"
        echo ""
        echo -e "${BLUE}=== Frontend Logs ===${NC}"
        tail -20 frontend.log 2>/dev/null || echo "No frontend logs found"
        echo ""
        echo -e "${BLUE}=== Keep-Alive Logs ===${NC}"
        tail -20 keep-alive.log 2>/dev/null || echo "No keep-alive logs found"
        ;;
        
    *)
        echo "Usage: $0 {start|stop|restart|status|monitor|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start both services"
        echo "  stop    - Stop both services"
        echo "  restart - Restart both services"
        echo "  status  - Show current status"
        echo "  monitor - Keep services running continuously"
        echo "  logs    - Show recent logs"
        exit 1
        ;;
esac