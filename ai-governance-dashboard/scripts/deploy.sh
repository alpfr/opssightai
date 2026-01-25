#!/bin/bash

# AI Governance Dashboard Deployment Script with AI Model Support
# Usage: ./scripts/deploy.sh [environment] [options] [model-type]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-development}
BUILD_ONLY=${2:-false}
SKIP_TESTS=${3:-false}
MODEL_TYPE=${4:-"all"}

# Configuration
APP_NAME="ai-governance-dashboard"
DOCKER_IMAGE="$APP_NAME:latest"
CONTAINER_NAME="$APP_NAME-container"

echo -e "${BLUE}🚀 Starting deployment for AI Governance Dashboard${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Build Only: $BUILD_ONLY${NC}"
echo -e "${BLUE}Model Type: $MODEL_TYPE${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed - skipping containerized deployment"
        DOCKER_AVAILABLE=false
    else
        DOCKER_AVAILABLE=true
    fi
    
    print_status "Prerequisites check completed"
}

# Install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm ci
    print_status "Dependencies installed"
}

# Run tests
run_tests() {
    if [ "$SKIP_TESTS" = "false" ]; then
        echo -e "${BLUE}🧪 Running tests...${NC}"
        npm test -- --coverage --watchAll=false
        print_status "Tests completed"
    else
        print_warning "Skipping tests"
    fi
}

# Setup AI model configuration
setup_ai_model_config() {
    echo -e "${BLUE}🤖 Setting up AI model configuration...${NC}"
    
    # Use model-specific environment if available
    if [ -f ".env.${MODEL_TYPE}" ] && [ "$MODEL_TYPE" != "all" ]; then
        echo "Using model-specific configuration: .env.${MODEL_TYPE}"
        cp ".env.${MODEL_TYPE}" ".env.local"
    fi
    
    # Set model-specific environment variables
    case $ENVIRONMENT in
        "production")
            export REACT_APP_ENV=production
            export REACT_APP_MODEL_TYPE=$MODEL_TYPE
            export GENERATE_SOURCEMAP=false
            ;;
        "staging")
            export REACT_APP_ENV=staging
            export REACT_APP_MODEL_TYPE=$MODEL_TYPE
            export GENERATE_SOURCEMAP=true
            ;;
        *)
            export REACT_APP_ENV=development
            export REACT_APP_MODEL_TYPE=$MODEL_TYPE
            export GENERATE_SOURCEMAP=true
            ;;
    esac
    
    print_status "AI model configuration setup completed"
}
# Build application
build_application() {
    echo -e "${BLUE}🏗️  Building application...${NC}"
    
    # Setup AI model configuration first
    setup_ai_model_config
    
    # Set environment variables based on deployment environment
    case $ENVIRONMENT in
        "production")
            export REACT_APP_ENV=production
            export GENERATE_SOURCEMAP=false
            ;;
        "staging")
            export REACT_APP_ENV=staging
            export GENERATE_SOURCEMAP=true
            ;;
        *)
            export REACT_APP_ENV=development
            export GENERATE_SOURCEMAP=true
            ;;
    esac
    
    npm run build
    print_status "Application built successfully"
}

# Build Docker image
build_docker_image() {
    if [ "$DOCKER_AVAILABLE" = "true" ]; then
        echo -e "${BLUE}🐳 Building Docker image...${NC}"
        docker build -t $DOCKER_IMAGE .
        print_status "Docker image built: $DOCKER_IMAGE"
    fi
}

# Deploy with Docker
deploy_docker() {
    if [ "$DOCKER_AVAILABLE" = "true" ] && [ "$BUILD_ONLY" = "false" ]; then
        echo -e "${BLUE}🚢 Deploying with Docker...${NC}"
        
        # Stop existing container if running
        if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
            echo "Stopping existing container..."
            docker stop $CONTAINER_NAME
            docker rm $CONTAINER_NAME
        fi
        
        # Run new container
        docker run -d \
            --name $CONTAINER_NAME \
            -p 3000:80 \
            --restart unless-stopped \
            $DOCKER_IMAGE
        
        print_status "Docker container deployed: $CONTAINER_NAME"
        echo -e "${GREEN}🌐 Application available at: http://localhost:3000${NC}"
    fi
}

# Deploy with Docker Compose
deploy_docker_compose() {
    if [ "$DOCKER_AVAILABLE" = "true" ] && [ "$BUILD_ONLY" = "false" ]; then
        echo -e "${BLUE}🐳 Deploying with Docker Compose...${NC}"
        
        # Use different compose files based on environment
        case $ENVIRONMENT in
            "production")
                docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
                ;;
            "staging")
                docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
                ;;
            *)
                docker-compose up -d
                ;;
        esac
        
        print_status "Docker Compose deployment completed"
    fi
}

# Deploy to static hosting (Netlify/Vercel style)
deploy_static() {
    if [ "$BUILD_ONLY" = "false" ]; then
        echo -e "${BLUE}📁 Preparing static deployment...${NC}"
        
        # Create deployment package
        DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
        mkdir -p $DEPLOY_DIR
        cp -r build/* $DEPLOY_DIR/
        
        # Create deployment info
        cat > $DEPLOY_DIR/deployment-info.json << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "environment": "$ENVIRONMENT",
    "version": "$(npm pkg get version | tr -d '"')",
    "commit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
}
EOF
        
        print_status "Static deployment package created: $DEPLOY_DIR"
        echo -e "${YELLOW}📋 Upload the contents of '$DEPLOY_DIR' to your static hosting provider${NC}"
    fi
}

# Health check
health_check() {
    if [ "$BUILD_ONLY" = "false" ] && [ "$DOCKER_AVAILABLE" = "true" ]; then
        echo -e "${BLUE}🏥 Running health check...${NC}"
        
        # Wait for container to start
        sleep 5
        
        # Check if container is running
        if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
            # Try to curl the health endpoint
            if curl -f http://localhost:3000/health > /dev/null 2>&1; then
                print_status "Health check passed"
            else
                print_warning "Health check failed - container may still be starting"
            fi
        else
            print_error "Container is not running"
        fi
    fi
}

# Cleanup function
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    
    # Remove old Docker images (keep last 3)
    if [ "$DOCKER_AVAILABLE" = "true" ]; then
        docker images $APP_NAME --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}" | \
        tail -n +2 | head -n -3 | awk '{print $2}' | xargs -r docker rmi
    fi
    
    print_status "Cleanup completed"
}

# Main deployment flow
main() {
    echo -e "${BLUE}🎯 Starting deployment process...${NC}"
    
    check_prerequisites
    install_dependencies
    
    if [ "$SKIP_TESTS" = "false" ]; then
        run_tests
    fi
    
    build_application
    
    if [ "$DOCKER_AVAILABLE" = "true" ]; then
        build_docker_image
        
        # Choose deployment method
        if [ -f "docker-compose.yml" ]; then
            deploy_docker_compose
        else
            deploy_docker
        fi
        
        health_check
    else
        deploy_static
    fi
    
    cleanup
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    
    # Print access information
    echo -e "${BLUE}📋 Access Information:${NC}"
    echo -e "  🌐 Application URL: http://localhost:3000"
    echo -e "  👤 Demo Credentials:"
    echo -e "    Developer: developer@demo.com / demo123"
    echo -e "    DPO: dpo@demo.com / demo123"
    echo -e "    Executive: executive@demo.com / demo123"
}

# Handle script arguments
case $1 in
    "help"|"-h"|"--help")
        echo "AI Governance Dashboard Deployment Script"
        echo ""
        echo "Usage: $0 [environment] [build-only] [skip-tests] [model-type]"
        echo ""
        echo "Arguments:"
        echo "  environment   Deployment environment (development|staging|production)"
        echo "  build-only    Only build, don't deploy (true|false)"
        echo "  skip-tests    Skip running tests (true|false)"
        echo "  model-type    AI model type (llama3|mistral|qwen2|deepseek-coder|phi3|all)"
        echo ""
        echo "Examples:"
        echo "  $0 production false false llama3"
        echo "  $0 staging true false mistral"
        echo "  $0 development false true all"
        exit 0
        ;;
    *)
        main
        ;;
esac