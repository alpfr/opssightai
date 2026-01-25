#!/bin/bash

# AI Governance Dashboard Setup Script
# Usage: ./scripts/setup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AI Governance Dashboard Setup Script${NC}"

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

# Check system requirements
check_requirements() {
    echo -e "${BLUE}🔍 Checking system requirements...${NC}"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo "Node.js version: $NODE_VERSION"
        
        # Check if version is >= 14
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 14 ]; then
            print_error "Node.js version 14 or higher is required"
            exit 1
        fi
    else
        print_error "Node.js is not installed"
        echo "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo "npm version: $NPM_VERSION"
    else
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Git (optional)
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        echo "Git version: $GIT_VERSION"
    else
        print_warning "Git is not installed (optional for development)"
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        echo "Docker version: $DOCKER_VERSION"
    else
        print_warning "Docker is not installed (optional for containerized deployment)"
    fi
    
    print_status "System requirements check completed"
}

# Install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing project dependencies...${NC}"
    
    # Clean install
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_status "Dependencies installed successfully"
}

# Setup development environment
setup_dev_environment() {
    echo -e "${BLUE}🛠️  Setting up development environment...${NC}"
    
    # Create .env.local file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        cat > .env.local << 'EOF'
# AI Governance Dashboard - Local Development Environment
REACT_APP_ENV=development
GENERATE_SOURCEMAP=true
BROWSER=none
EOF
        print_status "Created .env.local file"
    else
        echo ".env.local already exists"
    fi
    
    # Create scripts directory if it doesn't exist
    mkdir -p scripts
    
    # Make scripts executable
    if [ -f "scripts/build.sh" ]; then
        chmod +x scripts/build.sh
    fi
    
    if [ -f "scripts/deploy.sh" ]; then
        chmod +x scripts/deploy.sh
    fi
    
    if [ -f "scripts/setup.sh" ]; then
        chmod +x scripts/setup.sh
    fi
    
    print_status "Development environment configured"
}

# Setup Git hooks (if Git is available)
setup_git_hooks() {
    if command -v git &> /dev/null && [ -d ".git" ]; then
        echo -e "${BLUE}🔗 Setting up Git hooks...${NC}"
        
        # Create pre-commit hook
        mkdir -p .git/hooks
        
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# AI Governance Dashboard - Pre-commit hook

echo "Running pre-commit checks..."

# Run linter
if npm run lint --if-present; then
    echo "✅ Linting passed"
else
    echo "❌ Linting failed"
    exit 1
fi

# Run tests
if npm test -- --coverage --watchAll=false --passWithNoTests; then
    echo "✅ Tests passed"
else
    echo "❌ Tests failed"
    exit 1
fi

echo "✅ Pre-commit checks completed"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_status "Git hooks configured"
    else
        print_warning "Git not available or not a Git repository - skipping Git hooks"
    fi
}

# Setup AI model configurations
setup_ai_models() {
    echo -e "${BLUE}🤖 Setting up AI model configurations...${NC}"
    
    # Check if AI model setup script exists
    if [ -f "scripts/ai-model-setup.sh" ]; then
        # Make it executable
        chmod +x scripts/ai-model-setup.sh
        
        # Run AI model setup for development environment
        ./scripts/ai-model-setup.sh all development
        
        print_status "AI model configurations setup completed"
    else
        print_warning "AI model setup script not found - skipping AI model configuration"
    fi
}
# Create useful npm scripts
setup_npm_scripts() {
    echo -e "${BLUE}📝 Setting up additional npm scripts...${NC}"
    
    # Check if jq is available for JSON manipulation
    if command -v jq &> /dev/null; then
        # Add custom scripts to package.json
        jq '.scripts += {
            "dev": "npm start",
            "build:dev": "./scripts/build.sh development",
            "build:staging": "./scripts/build.sh staging",
            "build:prod": "./scripts/build.sh production",
            "deploy:dev": "./scripts/deploy.sh development",
            "deploy:staging": "./scripts/deploy.sh staging",
            "deploy:prod": "./scripts/deploy.sh production",
            "serve": "npx serve -s build",
            "analyze": "npm run build && npx serve -s build",
            "docker:build": "docker build -t ai-governance-dashboard .",
            "docker:run": "docker run -p 3000:80 ai-governance-dashboard",
            "docker:compose": "docker-compose up -d",
            "clean": "rm -rf build dist node_modules package-lock.json",
            "fresh": "npm run clean && npm install"
        }' package.json > package.json.tmp && mv package.json.tmp package.json
        
        print_status "Additional npm scripts added"
    else
        print_warning "jq not available - skipping npm scripts setup"
        echo "You can manually add these useful scripts to package.json:"
        echo '  "dev": "npm start"'
        echo '  "build:prod": "./scripts/build.sh production"'
        echo '  "deploy:prod": "./scripts/deploy.sh production"'
    fi
}

# Create VS Code configuration
setup_vscode() {
    echo -e "${BLUE}💻 Setting up VS Code configuration...${NC}"
    
    mkdir -p .vscode
    
    # Create settings.json
    cat > .vscode/settings.json << 'EOF'
{
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "emmet.includeLanguages": {
        "javascript": "javascriptreact"
    },
    "files.associations": {
        "*.js": "javascriptreact"
    },
    "typescript.preferences.quoteStyle": "single",
    "javascript.preferences.quoteStyle": "single"
}
EOF
    
    # Create extensions.json
    cat > .vscode/extensions.json << 'EOF'
{
    "recommendations": [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-json",
        "formulahendry.auto-rename-tag",
        "christian-kohler.path-intellisense",
        "ms-vscode.vscode-typescript-next"
    ]
}
EOF
    
    # Create launch.json for debugging
    cat > .vscode/launch.json << 'EOF'
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Chrome",
            "request": "launch",
            "type": "chrome",
            "url": "http://localhost:3000",
            "webRoot": "${workspaceFolder}/src",
            "sourceMapPathOverrides": {
                "webpack:///src/*": "${webRoot}/*"
            }
        }
    ]
}
EOF
    
    print_status "VS Code configuration created"
}

# Run initial tests
run_initial_tests() {
    echo -e "${BLUE}🧪 Running initial tests...${NC}"
    
    if npm test -- --coverage --watchAll=false --passWithNoTests; then
        print_status "Initial tests passed"
    else
        print_warning "Some tests failed - this is normal for a new setup"
    fi
}

# Create README for scripts
create_scripts_readme() {
    cat > scripts/README.md << 'EOF'
# Deployment Scripts

This directory contains scripts for building and deploying the AI Governance Dashboard.

## Scripts

### setup.sh
Initial project setup script. Run this once after cloning the repository.
```bash
./scripts/setup.sh
```

### build.sh
Build the application for different environments.
```bash
./scripts/build.sh [environment]
```
Environments: development, staging, production

### deploy.sh
Deploy the application using various methods.
```bash
./scripts/deploy.sh [environment] [build-only] [skip-tests]
```

## Usage Examples

```bash
# Initial setup
./scripts/setup.sh

# Development build
./scripts/build.sh development

# Production build and deploy
./scripts/build.sh production
./scripts/deploy.sh production

# Quick deploy with Docker
./scripts/deploy.sh production false false
```

## Requirements

- Node.js 14+
- npm
- Docker (optional, for containerized deployment)
- Git (optional, for version control features)
EOF
    
    print_status "Scripts documentation created"
}

# Display completion message
show_completion_message() {
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo -e "  1. Start development server: ${YELLOW}npm start${NC}"
    echo -e "  2. Open browser: ${YELLOW}http://localhost:3000${NC}"
    echo -e "  3. Login with demo credentials:"
    echo -e "     • Developer: developer@demo.com / demo123"
    echo -e "     • DPO: dpo@demo.com / demo123"
    echo -e "     • Executive: executive@demo.com / demo123"
    echo ""
    echo -e "${BLUE}🛠️  Available Commands:${NC}"
    echo -e "  • ${YELLOW}npm start${NC} - Start development server"
    echo -e "  • ${YELLOW}npm run build${NC} - Build for production"
    echo -e "  • ${YELLOW}npm test${NC} - Run tests"
    echo -e "  • ${YELLOW}./scripts/build.sh production${NC} - Production build"
    echo -e "  • ${YELLOW}./scripts/deploy.sh production${NC} - Deploy to production"
    echo ""
    echo -e "${BLUE}📚 Documentation:${NC}"
    echo -e "  • README.md - Main project documentation"
    echo -e "  • scripts/README.md - Deployment scripts documentation"
}

# Main setup process
main() {
    echo -e "${BLUE}🎯 Starting setup process...${NC}"
    
    check_requirements
    install_dependencies
    setup_dev_environment
    setup_ai_models
    setup_git_hooks
    setup_npm_scripts
    setup_vscode
    create_scripts_readme
    run_initial_tests
    
    show_completion_message
}

# Run main function
main