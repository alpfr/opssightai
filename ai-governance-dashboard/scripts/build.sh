#!/bin/bash

# AI Governance Dashboard Build Script
# Usage: ./scripts/build.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-production}

echo -e "${BLUE}🏗️  AI Governance Dashboard Build Script${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Set environment variables
set_environment() {
    echo -e "${BLUE}🔧 Setting environment variables...${NC}"
    
    case $ENVIRONMENT in
        "production")
            export NODE_ENV=production
            export REACT_APP_ENV=production
            export GENERATE_SOURCEMAP=false
            export INLINE_RUNTIME_CHUNK=false
            ;;
        "staging")
            export NODE_ENV=production
            export REACT_APP_ENV=staging
            export GENERATE_SOURCEMAP=true
            export INLINE_RUNTIME_CHUNK=false
            ;;
        "development")
            export NODE_ENV=development
            export REACT_APP_ENV=development
            export GENERATE_SOURCEMAP=true
            ;;
        *)
            print_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    print_status "Environment variables set for $ENVIRONMENT"
}

# Clean previous builds
clean_build() {
    echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
    
    if [ -d "build" ]; then
        rm -rf build
    fi
    
    if [ -d "dist" ]; then
        rm -rf dist
    fi
    
    print_status "Previous builds cleaned"
}

# Install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Check if node_modules exists and package-lock.json is newer
    if [ ! -d "node_modules" ] || [ "package-lock.json" -nt "node_modules" ]; then
        npm ci
    else
        echo "Dependencies are up to date"
    fi
    
    print_status "Dependencies ready"
}

# Run linting
run_lint() {
    echo -e "${BLUE}🔍 Running linter...${NC}"
    
    if npm run lint --if-present; then
        print_status "Linting passed"
    else
        print_error "Linting failed"
        exit 1
    fi
}

# Run tests
run_tests() {
    echo -e "${BLUE}🧪 Running tests...${NC}"
    
    if npm test -- --coverage --watchAll=false --passWithNoTests; then
        print_status "Tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
}

# Build application
build_app() {
    echo -e "${BLUE}🔨 Building application...${NC}"
    
    # Start build
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Analyze bundle size
analyze_bundle() {
    echo -e "${BLUE}📊 Analyzing bundle size...${NC}"
    
    if [ -f "build/static/js/*.js" ]; then
        echo "Bundle sizes:"
        ls -lh build/static/js/*.js | awk '{print "  " $9 ": " $5}'
        
        # Check for large bundles (>2MB)
        find build/static/js -name "*.js" -size +2M -exec echo "⚠️  Large bundle detected: {} ($(du -h {} | cut -f1))" \;
    fi
    
    print_status "Bundle analysis completed"
}

# Generate build report
generate_report() {
    echo -e "${BLUE}📋 Generating build report...${NC}"
    
    BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    BUILD_SIZE=$(du -sh build 2>/dev/null | cut -f1 || echo "Unknown")
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    
    cat > build/build-report.json << EOF
{
    "buildTime": "$BUILD_TIME",
    "environment": "$ENVIRONMENT",
    "version": "$(npm pkg get version | tr -d '"')",
    "buildSize": "$BUILD_SIZE",
    "gitCommit": "$GIT_COMMIT",
    "gitBranch": "$GIT_BRANCH",
    "nodeVersion": "$(node --version)",
    "npmVersion": "$(npm --version)"
}
EOF
    
    # Create human-readable report
    cat > build/BUILD_INFO.txt << EOF
AI Governance Dashboard - Build Information
==========================================

Build Time: $BUILD_TIME
Environment: $ENVIRONMENT
Version: $(npm pkg get version | tr -d '"')
Build Size: $BUILD_SIZE
Git Commit: $GIT_COMMIT
Git Branch: $GIT_BRANCH
Node Version: $(node --version)
NPM Version: $(npm --version)

Files Generated:
$(find build -type f | wc -l) files
$(find build -name "*.js" | wc -l) JavaScript files
$(find build -name "*.css" | wc -l) CSS files
$(find build -name "*.html" | wc -l) HTML files

Access Information:
- Application URL: Serve the 'build' directory with a web server
- Demo Credentials:
  * Developer: developer@demo.com / demo123
  * DPO: dpo@demo.com / demo123
  * Executive: executive@demo.com / demo123
EOF
    
    print_status "Build report generated"
}

# Optimize build
optimize_build() {
    echo -e "${BLUE}⚡ Optimizing build...${NC}"
    
    # Compress files if gzip is available
    if command -v gzip &> /dev/null; then
        find build -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -k {} \;
        print_status "Files compressed with gzip"
    fi
    
    # Create .htaccess for Apache servers
    cat > build/.htaccess << 'EOF'
# AI Governance Dashboard - Apache Configuration

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Handle React Router
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
</IfModule>
EOF
    
    print_status "Build optimized"
}

# Main build process
main() {
    echo -e "${BLUE}🎯 Starting build process...${NC}"
    
    set_environment
    clean_build
    install_dependencies
    run_lint
    
    if [ "$ENVIRONMENT" != "development" ]; then
        run_tests
    fi
    
    build_app
    analyze_bundle
    generate_report
    optimize_build
    
    echo -e "${GREEN}🎉 Build completed successfully!${NC}"
    echo -e "${BLUE}📁 Build output: ./build${NC}"
    echo -e "${BLUE}📊 Build size: $(du -sh build | cut -f1)${NC}"
    
    # Show next steps
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo -e "  1. Test the build: npx serve -s build"
    echo -e "  2. Deploy: ./scripts/deploy.sh $ENVIRONMENT"
    echo -e "  3. Or upload 'build' directory to your web server"
}

# Handle script arguments
case $1 in
    "help"|"-h"|"--help")
        echo "AI Governance Dashboard Build Script"
        echo ""
        echo "Usage: $0 [environment]"
        echo ""
        echo "Environments:"
        echo "  development   Development build with source maps"
        echo "  staging       Staging build with source maps"
        echo "  production    Production build optimized for deployment"
        echo ""
        echo "Examples:"
        echo "  $0 production"
        echo "  $0 staging"
        exit 0
        ;;
    *)
        main
        ;;
esac