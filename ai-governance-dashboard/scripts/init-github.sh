#!/bin/bash

# AI Governance Dashboard - GitHub Initialization Script
# Usage: ./scripts/init-github.sh [repository-url]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository URL (optional parameter)
REPO_URL=${1:-""}

echo -e "${BLUE}🚀 AI Governance Dashboard - GitHub Setup${NC}"

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

# Check if git is installed
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    print_status "Git is available"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -d "src" ]; then
        print_error "Please run this script from the ai-governance-dashboard root directory"
        exit 1
    fi
    print_status "In correct project directory"
}

# Initialize git repository
init_git() {
    if [ -d ".git" ]; then
        print_warning "Git repository already initialized"
        return
    fi
    
    echo -e "${BLUE}📝 Initializing Git repository...${NC}"
    git init
    print_status "Git repository initialized"
}

# Configure git (if not already configured)
configure_git() {
    echo -e "${BLUE}⚙️  Configuring Git...${NC}"
    
    # Check if user name is configured
    if ! git config user.name &> /dev/null; then
        read -p "Enter your Git username: " git_username
        git config user.name "$git_username"
    fi
    
    # Check if user email is configured
    if ! git config user.email &> /dev/null; then
        read -p "Enter your Git email: " git_email
        git config user.email "$git_email"
    fi
    
    print_status "Git configuration complete"
    echo "  Username: $(git config user.name)"
    echo "  Email: $(git config user.email)"
}

# Add files to git
add_files() {
    echo -e "${BLUE}📁 Adding files to Git...${NC}"
    
    # Add all files except those in .gitignore
    git add .
    
    # Show status
    echo "Files to be committed:"
    git status --porcelain | head -20
    if [ $(git status --porcelain | wc -l) -gt 20 ]; then
        echo "... and $(( $(git status --porcelain | wc -l) - 20 )) more files"
    fi
    
    print_status "Files added to Git staging area"
}

# Create initial commit
create_commit() {
    echo -e "${BLUE}💾 Creating initial commit...${NC}"
    
    # Check if there are changes to commit
    if git diff --cached --quiet; then
        print_warning "No changes to commit"
        return
    fi
    
    # Create commit with detailed message
    git commit -m "feat: initial commit of AI Governance Dashboard

- Complete React application with role-based access control
- Three user roles: Developer, DPO, Executive
- AI model onboarding and compliance tracking
- Risk assessment and classification system
- Responsive dashboard with Tailwind CSS
- Docker and Docker Compose deployment
- AWS EKS deployment with Kubernetes manifests
- Helm charts for templated deployments
- Comprehensive deployment scripts and documentation
- CI/CD workflows for GitHub Actions
- Production-ready with security best practices

Demo credentials:
- Developer: developer@demo.com / demo123
- DPO: dpo@demo.com / demo123
- Executive: executive@demo.com / demo123"

    print_status "Initial commit created"
}

# Add remote repository
add_remote() {
    if [ -z "$REPO_URL" ]; then
        echo -e "${YELLOW}📡 Repository URL not provided${NC}"
        echo "To add remote repository later, run:"
        echo "  git remote add origin https://github.com/USERNAME/REPOSITORY.git"
        echo "  git branch -M main"
        echo "  git push -u origin main"
        return
    fi
    
    echo -e "${BLUE}📡 Adding remote repository...${NC}"
    
    # Remove existing origin if it exists
    if git remote get-url origin &> /dev/null; then
        git remote remove origin
    fi
    
    # Add new origin
    git remote add origin "$REPO_URL"
    print_status "Remote repository added: $REPO_URL"
}

# Push to GitHub
push_to_github() {
    if [ -z "$REPO_URL" ]; then
        print_warning "Skipping push - no repository URL provided"
        return
    fi
    
    echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
    
    # Set main branch
    git branch -M main
    
    # Push to GitHub
    if git push -u origin main; then
        print_status "Successfully pushed to GitHub!"
        echo -e "${GREEN}🌐 Repository URL: $REPO_URL${NC}"
    else
        print_error "Failed to push to GitHub"
        echo "Please check:"
        echo "  1. Repository exists and you have write access"
        echo "  2. GitHub authentication is configured"
        echo "  3. Repository URL is correct"
        exit 1
    fi
}

# Create GitHub repository (if gh CLI is available)
create_github_repo() {
    if ! command -v gh &> /dev/null; then
        print_warning "GitHub CLI (gh) not installed - skipping repository creation"
        echo "To create repository manually:"
        echo "  1. Go to https://github.com/new"
        echo "  2. Create repository named 'ai-governance-dashboard'"
        echo "  3. Run this script again with the repository URL"
        return
    fi
    
    if [ -n "$REPO_URL" ]; then
        print_warning "Repository URL provided - skipping creation"
        return
    fi
    
    echo -e "${BLUE}🏗️  Creating GitHub repository...${NC}"
    
    read -p "Create GitHub repository? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Create repository
        gh repo create ai-governance-dashboard \
            --public \
            --description "AI Governance Dashboard - Comprehensive AI model compliance and risk management platform" \
            --homepage "https://github.com/$(gh api user --jq .login)/ai-governance-dashboard" \
            --add-readme=false
        
        # Get repository URL
        REPO_URL="https://github.com/$(gh api user --jq .login)/ai-governance-dashboard.git"
        print_status "GitHub repository created: $REPO_URL"
    fi
}

# Display next steps
show_next_steps() {
    echo -e "${GREEN}🎉 GitHub setup complete!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    
    if [ -n "$REPO_URL" ]; then
        echo -e "  1. 🌐 Visit your repository: ${REPO_URL%.git}"
        echo -e "  2. 📝 Update repository description and topics"
        echo -e "  3. 🔧 Configure GitHub Actions secrets for EKS deployment:"
        echo -e "     - AWS_ACCESS_KEY_ID"
        echo -e "     - AWS_SECRET_ACCESS_KEY"
        echo -e "  4. 🏷️  Create your first release"
        echo -e "  5. 📚 Enable GitHub Pages for documentation (optional)"
    else
        echo -e "  1. 🏗️  Create GitHub repository at https://github.com/new"
        echo -e "  2. 📡 Add remote: git remote add origin YOUR_REPO_URL"
        echo -e "  3. 🚀 Push code: git push -u origin main"
    fi
    
    echo ""
    echo -e "${BLUE}🔧 Repository Features:${NC}"
    echo -e "  ✅ Comprehensive README with deployment instructions"
    echo -e "  ✅ GitHub Actions CI/CD workflows"
    echo -e "  ✅ Issue and PR templates"
    echo -e "  ✅ Contributing guidelines"
    echo -e "  ✅ MIT License"
    echo -e "  ✅ Proper .gitignore for Node.js/React projects"
    echo ""
    echo -e "${BLUE}🚀 Demo the Application:${NC}"
    echo -e "  • Local: npm start (http://localhost:3000)"
    echo -e "  • Docker: ./scripts/deploy.sh production"
    echo -e "  • EKS: ./scripts/create-eks-cluster.sh && ./scripts/deploy-eks.sh production"
    echo ""
    echo -e "${YELLOW}💡 Pro Tips:${NC}"
    echo -e "  • Add repository topics: ai, governance, compliance, react, kubernetes"
    echo -e "  • Enable Dependabot for security updates"
    echo -e "  • Set up branch protection rules for main branch"
    echo -e "  • Configure GitHub Pages for project documentation"
}

# Main execution
main() {
    echo -e "${BLUE}🎯 Starting GitHub setup process...${NC}"
    
    check_git
    check_directory
    init_git
    configure_git
    add_files
    create_commit
    create_github_repo
    add_remote
    push_to_github
    show_next_steps
}

# Handle script arguments
case $1 in
    "help"|"-h"|"--help")
        echo "AI Governance Dashboard - GitHub Setup Script"
        echo ""
        echo "Usage: $0 [repository-url]"
        echo ""
        echo "Arguments:"
        echo "  repository-url   GitHub repository URL (optional)"
        echo ""
        echo "Examples:"
        echo "  $0"
        echo "  $0 https://github.com/username/ai-governance-dashboard.git"
        echo ""
        echo "This script will:"
        echo "  1. Initialize Git repository"
        echo "  2. Configure Git user settings"
        echo "  3. Add all files to Git"
        echo "  4. Create initial commit"
        echo "  5. Add remote repository (if URL provided)"
        echo "  6. Push to GitHub (if URL provided)"
        echo ""
        echo "Prerequisites:"
        echo "  - Git installed and configured"
        echo "  - GitHub repository created (or gh CLI for auto-creation)"
        echo "  - GitHub authentication configured"
        exit 0
        ;;
    *)
        main
        ;;
esac