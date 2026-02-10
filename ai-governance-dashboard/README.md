# AI Governance & Compliance Platform Suite

A comprehensive suite of AI governance and compliance solutions for managing AI model compliance, risk assessment, and regulatory oversight.

> **🎯 Production-Ready**: Two enterprise platforms deployed on Google Kubernetes Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/kubernetes-ready-326CE5)](https://kubernetes.io/)

## 🚀 Deployed Platforms

### AI Compliance Platform ✅ LIVE
**Production URL**: http://136.110.182.171/  
**Status**: Fully operational on GKE  
**Login**: admin/admin123 or inspector/inspector123

A production-ready platform for AI compliance assessment and monitoring:
- 🤖 **LLM Assessment**: Test 7 AI models (GPT-4, Claude, Gemini, etc.) for compliance
- 🛡️ **Real-Time Guardrails**: Automated content filtering (PII, regulatory language, bias)
- 📊 **Executive Dashboard**: Strategic KPIs and risk assessment for C-suite
- 🛠️ **LLM Management**: Complete AI model lifecycle management (Admin only)
- 📋 **Compliance Assessments**: Structured evaluation framework with scoring
- 📝 **Audit Trail**: Regulatory-grade activity logging

**📖 Full Documentation**: [ai-compliance-platform/README.md](./ai-compliance-platform/README.md)

### OpsSightAI ✅ LIVE
**Production URL**: http://34.57.180.112  
**Status**: Deployed on GKE  

Industrial operations monitoring and predictive maintenance platform.

**📖 Full Documentation**: [opssightai/README.md](./opssightai/README.md)

---

## AI Governance Dashboard (Local Development)

A React-based AI Governance Dashboard MVP for managing AI model compliance and risk assessment. This application provides a comprehensive solution for organizations to track, monitor, and ensure compliance of their AI models according to regulatory requirements like the EU AI Act.

> **🎯 Demo-Ready**: Professional demonstration platform with interactive tour, realistic data, and role-based workflows

## 📁 Repository Structure

This repository contains multiple AI governance and compliance platforms:

```
cloudformation/
├── ai-compliance-platform/    # ✅ PRODUCTION - AI Compliance Platform (GKE)
│   ├── backend/               # FastAPI backend with SQLite
│   ├── frontend/              # React frontend with Material-UI
│   ├── k8s/                   # Kubernetes manifests and Helm charts
│   └── README.md              # Complete platform documentation
├── opssightai/                # ✅ PRODUCTION - OpsSightAI Platform (GKE)
│   ├── backend/               # Node.js/TypeScript backend
│   ├── frontend/              # React/TypeScript frontend
│   └── README.md              # Platform documentation
├── kiro-scripts-review/       # Sermon transcription and content generation
├── mp3-transcription/         # MP3 transcription service
├── src/                       # AI Governance Dashboard (local dev)
├── scripts/                   # Deployment and build scripts
├── k8s/                       # Kubernetes manifests for EKS
└── helm/                      # Helm charts for deployments
```

### Quick Navigation
- **AI Compliance Platform**: [ai-compliance-platform/](./ai-compliance-platform/) - Production platform on GKE
- **OpsSightAI**: [opssightai/](./opssightai/) - Industrial operations platform
- **AI Governance Dashboard**: [src/](./src/) - Local development dashboard
- **Deployment Scripts**: [scripts/](./scripts/) - Automated deployment tools

---

## 🚀 AI Governance Dashboard Features

### Core Functionality
- **Global Risk Overview** - Real-time compliance gauge showing organizational risk level
- **Model Registry** - Comprehensive table of all AI models with filtering and sorting
- **Onboard New Models** - Streamlined form for adding new AI models with automatic risk classification
- **Role-based Access Control** - Different permissions and views for Developer, DPO, and Executive roles
- **Compliance Tracking** - Pass/Fail/Pending status with DPO approval workflow
- **Risk Classification** - Automatic categorization as High-Risk, Limited, or Minimal based on use case

### Demo Features ✨
- **Interactive Demo Tour** - Guided walkthrough highlighting key features and workflows
- **Demo Mode Banner** - Clear indication of demonstration environment with tour access
- **Realistic Sample Data** - 10 diverse AI models across different industries and compliance states
- **Success Notifications** - User feedback for all actions and state changes
- **Export Functionality** - CSV report generation for executive compliance reporting
- **Professional Presentation** - Optimized for stakeholder demonstrations and pitches

### Technical Features
- **Local Authentication** - Demo login system with persistent sessions
- **Data Persistence** - Browser localStorage for demo data storage
- **Responsive Design** - Mobile-friendly interface using Tailwind CSS
- **Real-time Updates** - Instant UI updates across all components
- **Sample Data** - Pre-loaded with 10 realistic AI model examples

## 🛠 Technology Stack

- **Frontend**: React 18.2.0
- **Routing**: React Router DOM 6.8.0
- **Styling**: Tailwind CSS 3.4.0
- **Charts**: Recharts 2.8.0
- **Icons**: Heroicons 2.0.18
- **Authentication**: Local storage-based demo system
- **Data Storage**: Browser localStorage (demo mode)

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Git (for version control)
- Docker (optional, for containerized deployment)
- AWS CLI (optional, for EKS deployment)

## 🎯 Getting Started with GitHub

### 🔄 Setting Up Your Repository

If you want to create your own copy of this repository:

1. **Fork or Clone**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/ai-governance-dashboard.git
   cd ai-governance-dashboard
   
   # Or clone the original repository
   git clone https://github.com/original-owner/ai-governance-dashboard.git
   cd ai-governance-dashboard
   ```

2. **Initialize Your Repository** (if starting fresh)
   ```bash
   # Use our automated GitHub setup script
   ./scripts/init-github.sh
   
   # Or manually initialize
   git init
   git add .
   git commit -m "feat: initial commit of AI Governance Dashboard"
   git remote add origin https://github.com/YOUR_USERNAME/ai-governance-dashboard.git
   git push -u origin main
   ```

### 🔧 Repository Configuration

After setting up your repository:

1. **Configure GitHub Actions Secrets** (for automated deployments)
   - Go to Settings → Secrets and variables → Actions
   - Add: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

2. **Enable Repository Features**
   - Issues (for bug reports and feature requests)
   - Discussions (for community questions)
   - Wiki (for additional documentation)

3. **Set Repository Topics**
   - Add topics: `ai`, `governance`, `compliance`, `react`, `kubernetes`, `dashboard`

### 🛡️ Branch Protection (Recommended)

Set up branch protection for the main branch:
- Go to Settings → Branches
- Add rule for `main` branch:
  - Require pull request reviews
  - Require status checks to pass
  - Restrict pushes to main branch

## 🚀 Quick Start

### Method 1: Automated Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-governance-dashboard.git
   cd ai-governance-dashboard
   ```

2. **Run the setup script**
   ```bash
   ./scripts/setup.sh
   ```
   This will:
   - Check system requirements
   - Install dependencies
   - Configure development environment
   - Set up Git hooks and VS Code settings

3. **Start development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - If port 3000 is in use, the app will prompt to use an alternative port

### Method 2: Manual Setup

1. **Clone or navigate to the project directory**
   ```bash
   git clone https://github.com/your-username/ai-governance-dashboard.git
   cd ai-governance-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## 🔐 Demo Login Credentials

The application includes three pre-configured demo accounts with different role permissions:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Developer** | `developer@demo.com` | `demo123` | • Onboard new models<br>• View model registry<br>• Cannot approve compliance |
| **DPO** | `dpo@demo.com` | `demo123` | • Approve/revoke DPO sign-offs<br>• Update compliance status<br>• Full model management |
| **Executive** | `executive@demo.com` | `demo123` | • View compliance overview<br>• Monitor risk metrics<br>• Export compliance reports |

### Quick Login
Use the demo login buttons on the login page for instant access, or manually enter the credentials above.

### 🎯 Demo Tour
After logging in, click the **"Take Tour"** button in the demo banner to get a guided walkthrough of all features and workflows.

## 📊 Sample Data

The dashboard comes pre-loaded with 12 sample AI models featuring modern LLMs and demonstrating different risk levels and compliance states:

### High-Risk Models (4)
1. **Llama3-70B Credit Scorer** (Passed) - Meta's large model for loan assessment
2. **Qwen2-72B Fraud Detector** (Failed) - Alibaba's model for transaction monitoring  
3. **Llama3-8B Medical Assistant** (Pending) - Medical diagnosis support system
4. **Llama3-405B Legal Advisor** (Pending) - Legal document analysis and advisory
5. **Mistral-Large HR Screener** (Failed) - Resume screening and candidate evaluation

### Limited Risk Models (5)
6. **Mistral-7B Support Assistant** (Passed) - Customer support with RAG capabilities
7. **DeepSeek-Coder Document Processor** (Pending) - Intelligent document classification
8. **Qwen2-7B Content Moderator** (Passed) - Social media content moderation
9. **DeepSeek-V2 Code Assistant** (Passed) - Code translation and programming support
10. **Mistral-Nemo Sentiment Analyzer** (Passed) - Customer feedback analysis

### Minimal Risk Models (2)
11. **Phi3-Mini Recommender** (Passed) - Microsoft's efficient recommendation system
12. **Phi3-Medium Price Optimizer** (Passed) - Dynamic e-commerce pricing

**Current Demo Metrics:**
- **67% Compliance Rate** (8/12 models passed)
- **4 High-Risk Models** requiring special attention
- **2 Failed Models** needing remediation
- **3 Pending Models** awaiting DPO review

**Featured AI Models:** Llama3 (Meta), Mistral AI, Qwen2 (Alibaba), DeepSeek-Coder, Phi3 (Microsoft)

## 🎯 User Roles & Workflows

### Developer Workflow
1. Log in with developer credentials
2. Use the "Onboard New Model" form to add AI models
3. Fill in model details (name, use case, description)
4. System automatically classifies risk tier with real-time preview
5. Model enters "Pending" compliance status
6. View all models in the registry table with filtering options

### DPO (Data Protection Officer) Workflow
1. Log in with DPO credentials
2. Review pending models in the registry (filter by "Pending Review")
3. Approve or reject compliance status with instant feedback
4. Provide DPO sign-off for approved models
5. Focus on high-risk models requiring additional scrutiny
6. Receive success notifications for all actions

### Executive Workflow
1. Log in with executive credentials
2. Monitor global compliance gauge and risk overview
3. Review compliance statistics and trends in the sidebar
4. Track high-risk model approvals and failures
5. Export compliance reports (CSV format) for board meetings
6. Ensure organizational regulatory readiness

### 🎭 Demo Presentation Mode
- **Interactive Tour**: Click "Take Tour" for guided feature walkthrough
- **Role Switching**: Demonstrate different user perspectives seamlessly  
- **Real-time Updates**: Show live compliance changes across roles
- **Professional Metrics**: Present meaningful compliance statistics

## 🔧 Risk Classification Logic

The system automatically classifies models based on their use case:

### High-Risk Models
- Credit Scoring
- Fraud Detection
- Hiring Decisions
- Medical Diagnosis
- Legal Decisions
- Insurance Underwriting

### Limited Risk Models
- Chatbots
- Content Moderation
- Document Processing
- Translation Services
- Sentiment Analysis

### Minimal Risk Models
- Recommendation Systems
- General Analytics
- Other use cases not in above categories

## 📱 Interface Overview

### Dashboard Components

1. **Global Risk Overview Gauge**
   - Visual compliance percentage with color-coded risk levels
   - Risk level indicator (Low/Medium/High) based on compliance rate
   - Detailed statistics breakdown with model counts
   - Interactive tour highlighting for demos

2. **Model Registry Table**
   - Sortable columns (name, risk tier, compliance status, last updated)
   - Advanced filtering (all models, high-risk only, failed compliance, pending review)
   - Role-based action buttons with success notifications
   - Real-time status updates across all user sessions

3. **Onboard New Model Form** (Developer Role)
   - Model name and description fields with validation
   - Use case selection with 13+ predefined options plus custom
   - Real-time risk tier preview showing automatic classification
   - Success feedback and automatic registry updates

4. **Navigation & User Management**
   - Role-based navigation with permission-specific features
   - User profile display with role badges and permissions
   - Demo mode banner with integrated tour access
   - Secure logout functionality with session cleanup

### 🎯 Demo-Specific Features

5. **Interactive Demo Tour**
   - 5-step guided walkthrough of key features
   - Contextual explanations for each dashboard component
   - Progress indicators and navigation controls
   - Professional presentation mode for stakeholders

6. **Enhanced User Feedback**
   - Success notifications for all user actions
   - Real-time compliance metric updates
   - Export functionality with CSV download
   - Professional error handling and validation

## 🚀 Deployment

The AI Governance Dashboard supports multiple deployment methods for different environments and use cases, from simple static hosting to enterprise-grade Kubernetes orchestration on AWS EKS.

### 🛠 Deployment Scripts

The project includes comprehensive deployment scripts in the `scripts/` directory:

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup.sh` | Initial project setup | `./scripts/setup.sh` |
| `build.sh` | Environment-specific builds | `./scripts/build.sh [environment]` |
| `deploy.sh` | Multi-method deployment | `./scripts/deploy.sh [environment] [options]` |
| `create-eks-cluster.sh` | **NEW** - Create AWS EKS cluster | `./scripts/create-eks-cluster.sh [cluster-name] [region]` |
| `deploy-eks.sh` | **NEW** - Deploy to EKS | `./scripts/deploy-eks.sh [environment] [cluster] [region]` |

### 📁 Deployment Files

| File/Directory | Purpose |
|----------------|---------|
| `Dockerfile` | Multi-stage Docker build configuration |
| `nginx.conf` | Production Nginx server configuration |
| `docker-compose.yml` | Base Docker Compose setup |
| `docker-compose.prod.yml` | Production overrides with SSL/TLS |
| `docker-compose.staging.yml` | Staging environment configuration |
| `.dockerignore` | Docker build optimization |
| **`k8s/`** | **NEW** - Kubernetes manifests for EKS |
| **`helm/`** | **NEW** - Helm charts for Kubernetes deployment |
| **`EKS-DEPLOYMENT.md`** | **NEW** - Comprehensive EKS deployment guide |

### 🎯 Quick Deployment Commands

```bash
# Initial setup (run once)
./scripts/setup.sh

# Development deployment
./scripts/deploy.sh development

# Production deployment
./scripts/deploy.sh production

# Build only (no deployment)
./scripts/deploy.sh production true

# Skip tests during deployment
./scripts/deploy.sh production false true
```

### 🐳 Docker Deployment

#### Single Container
```bash
# Build and run
docker build -t ai-governance-dashboard .
docker run -p 3000:80 ai-governance-dashboard
```

#### Docker Compose (Recommended)
```bash
# Development
docker-compose up -d

# Staging with auto-updates
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Production with SSL and reverse proxy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Docker Compose Services:**
- **Main App**: AI Governance Dashboard on port 3000
- **Traefik**: Reverse proxy with automatic SSL (Let's Encrypt)
- **Watchtower**: Auto-updates for staging environment

### 🌐 Static Hosting Deployment

Perfect for Netlify, Vercel, AWS S3, GitHub Pages, etc.

```bash
# Build for production
./scripts/build.sh production

# Upload contents of 'build/' directory to your hosting provider
```

**Supported Platforms:**
- **Netlify**: Drag & drop or Git integration
- **Vercel**: Git integration or CLI deployment
- **AWS S3**: `aws s3 sync build/ s3://your-bucket/`
- **GitHub Pages**: Copy to gh-pages branch
- **Firebase Hosting**: `firebase deploy`

### ☸️ AWS EKS Deployment

Deploy to Amazon EKS for production-grade Kubernetes orchestration with enterprise features.

#### Quick EKS Deployment
```bash
# 1. Create EKS cluster (15-20 minutes, one-time setup)
./scripts/create-eks-cluster.sh

# 2. Deploy application (5-10 minutes)
./scripts/deploy-eks.sh production

# 3. Get application URL
kubectl get ingress -n ai-governance
```

#### Custom EKS Deployment
```bash
# Create cluster with custom settings
./scripts/create-eks-cluster.sh my-cluster us-east-1

# Deploy to specific cluster
./scripts/deploy-eks.sh production my-cluster us-east-1

# Deploy with Helm (alternative)
helm upgrade --install ai-governance-dashboard ./helm \
  --namespace ai-governance \
  --create-namespace \
  --set image.repository=YOUR_ECR_URI \
  --set ingress.hosts[0].host=ai-governance.yourdomain.com
```

#### EKS Features & Benefits
- **🔄 Auto-scaling**: Horizontal Pod Autoscaler (3-10 pods) + Cluster Autoscaler (2-10 nodes)
- **⚖️ Load Balancing**: AWS Application Load Balancer with SSL/TLS termination
- **🔒 Security**: Network policies, RBAC, pod security standards, ECR image scanning
- **📊 Monitoring**: Prometheus & Grafana integration, CloudWatch logging
- **🌐 Multi-AZ**: High availability across 3 availability zones
- **💰 Cost Optimization**: Spot instances, resource quotas, intelligent scaling
- **🔧 DevOps Ready**: CI/CD integration, GitOps workflows, automated deployments

#### EKS Prerequisites
- **AWS CLI** configured with EKS, EC2, IAM, VPC permissions
- **Tools**: eksctl, kubectl, Helm, Docker
- **Resources**: VPC with sufficient IP addresses, appropriate IAM roles

**📖 For detailed EKS deployment instructions, troubleshooting, and advanced configurations, see [EKS-DEPLOYMENT.md](./EKS-DEPLOYMENT.md)**

### ⚙️ Environment Configuration

| Environment | Source Maps | Optimization | SSL | Monitoring | Auto-scaling | Deployment Method |
|-------------|-------------|--------------|-----|------------|--------------|-------------------|
| **Development** | ✅ | ❌ | ❌ | Basic | ❌ | Local/Docker |
| **Staging** | ✅ | ✅ | ❌ | Enhanced | ✅ | Docker Compose |
| **Production** | ❌ | ✅ | ✅ | Full | ✅ | Docker Compose/Static |
| **EKS Production** | ❌ | ✅ | ✅ | Prometheus/Grafana | HPA + CA | Kubernetes |

#### Environment-Specific Features

**Development**
- Hot reloading and source maps
- Local storage for demo data
- Basic health checks

**Staging** 
- Production-like optimizations
- Auto-deployment with Watchtower
- Enhanced monitoring

**Production (Docker)**
- SSL/TLS with Let's Encrypt
- Reverse proxy with Traefik
- Full monitoring stack

**EKS Production**
- Enterprise-grade Kubernetes orchestration
- Multi-AZ high availability
- Advanced auto-scaling and monitoring
- Network security policies
- Cost optimization features

### 🔧 Server Configuration

#### Nginx Configuration
```nginx
server {
    listen 80;
    root /path/to/build;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache Configuration
The build script automatically creates `.htaccess` with:
- React Router support
- Compression settings
- Cache headers
- Security headers

### 🔒 Production Deployment Checklist

Before deploying to production:

#### General Production Setup
- [ ] **Update Domain**: Modify configuration files with your actual domain
- [ ] **SSL Configuration**: Configure certificates (Let's Encrypt, ACM, or custom)
- [ ] **Environment Variables**: Set production-specific variables
- [ ] **Authentication**: Replace demo authentication with real system
- [ ] **Database**: Replace localStorage with proper database (PostgreSQL, MongoDB)
- [ ] **Monitoring**: Set up logging and monitoring
- [ ] **Security**: Review and update security headers
- [ ] **Backup**: Implement backup strategy

#### EKS-Specific Checklist
- [ ] **AWS Permissions**: Verify IAM roles and policies
- [ ] **VPC Configuration**: Ensure proper subnet and security group setup
- [ ] **ECR Repository**: Create and configure container registry
- [ ] **Load Balancer**: Configure ALB with proper health checks
- [ ] **Certificate Manager**: Set up SSL certificates in ACM
- [ ] **Monitoring**: Install Prometheus/Grafana stack
- [ ] **Autoscaling**: Configure HPA and Cluster Autoscaler
- [ ] **Network Policies**: Apply security policies
- [ ] **Resource Limits**: Set appropriate CPU/memory limits
- [ ] **Backup**: Configure EBS snapshots and cluster backups

### 📊 Deployment Monitoring

#### Health Checks
- **Endpoint**: `/health` - Returns application status
- **Readiness**: `/ready` - Returns readiness status (EKS)
- **Docker**: Built-in health checks included
- **Traefik Dashboard**: Available at `http://localhost:8080` (development)
- **EKS**: Kubernetes liveness and readiness probes

#### Logs and Monitoring
```bash
# Docker container logs
docker logs ai-governance-dashboard

# Docker Compose logs
docker-compose logs -f

# EKS logs
kubectl logs -f deployment/ai-governance-dashboard -n ai-governance

# Follow specific service logs
docker-compose logs -f ai-governance-dashboard

# EKS monitoring
kubectl get pods -n ai-governance
kubectl top pods -n ai-governance
kubectl get hpa -n ai-governance
```

#### Monitoring Stacks

**Docker Compose**
- Basic health checks
- Container metrics
- Log aggregation

**EKS Production**
- Prometheus metrics collection
- Grafana dashboards
- CloudWatch integration
- Application Performance Monitoring (APM)
- Distributed tracing ready

### 🚨 Troubleshooting Deployment

#### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Use different port
PORT=3001 npm start
```

**Docker Issues:**
```bash
# Clean Docker system
docker system prune -a

# Rebuild without cache
docker build --no-cache -t ai-governance-dashboard .
```

**EKS Issues:**
```bash
# Check cluster connection
kubectl cluster-info

# Check pod status
kubectl get pods -n ai-governance

# Describe pod for events
kubectl describe pod <pod-name> -n ai-governance

# Check logs
kubectl logs <pod-name> -n ai-governance

# Check ingress
kubectl get ingress -n ai-governance
kubectl describe ingress ai-governance-dashboard -n ai-governance
```

**Build Failures:**
```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

**Permission Issues:**
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# AWS permissions (EKS)
aws sts get-caller-identity
aws eks describe-cluster --name your-cluster --region your-region
```

**EKS-Specific Troubleshooting:**
```bash
# Check AWS Load Balancer Controller
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Check cluster autoscaler
kubectl logs -n kube-system deployment/cluster-autoscaler

# Check node status
kubectl get nodes
kubectl describe node <node-name>

# Check security groups
aws ec2 describe-security-groups --filters "Name=group-name,Values=*ai-governance*"
```

## 🔄 CI/CD Integration

The deployment scripts work seamlessly with popular CI/CD platforms:

### GitHub Actions (Included)

The repository includes pre-configured GitHub Actions workflows:

#### **Continuous Integration** (`.github/workflows/ci.yml`)
```yaml
# Automatically runs on push/PR to main branch
- Node.js testing (18.x, 20.x)
- ESLint code quality checks
- Security vulnerability scanning
- Docker image building
- Test coverage reporting
```

#### **EKS Deployment** (`.github/workflows/deploy-eks.yml`)
```yaml
# Deploy to EKS with workflow dispatch or main branch push
- Build and push to ECR
- Deploy to staging/production
- Health checks and verification
- Rollback on failure
```

**Setup GitHub Actions:**
1. Add repository secrets in Settings → Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
2. Workflows will run automatically on push/PR

#### Manual GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: ./scripts/setup.sh
      - run: ./scripts/deploy.sh production
```

#### GitHub Actions for EKS
```yaml
name: Deploy to EKS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      
      - name: Deploy to EKS
        run: |
          aws eks update-kubeconfig --region us-west-2 --name ai-governance-cluster
          ./scripts/deploy-eks.sh production
```

### Other CI/CD Platforms

#### GitLab CI Example
```yaml
deploy:
  stage: deploy
  script:
    - ./scripts/setup.sh
    - ./scripts/deploy.sh production
  only:
    - main
```

#### GitLab CI for EKS
```yaml
deploy-eks:
  stage: deploy
  image: amazon/aws-cli:latest
  before_script:
    - apk add --no-cache curl
    - curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    - chmod +x kubectl && mv kubectl /usr/local/bin/
  script:
    - aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
    - ./scripts/deploy-eks.sh production
  only:
    - main
```

For detailed deployment documentation, see `scripts/README.md` and `EKS-DEPLOYMENT.md`.

## 🛠 Development

### Available Scripts

#### Basic Commands
- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run test suite
- `npm eject` - Eject from Create React App (not recommended)

#### Enhanced Scripts (Added by setup.sh)
- `npm run dev` - Start development server (alias)
- `npm run build:dev` - Development build with source maps
- `npm run build:staging` - Staging build
- `npm run build:prod` - Production build
- `npm run deploy:dev` - Deploy to development
- `npm run deploy:staging` - Deploy to staging
- `npm run deploy:prod` - Deploy to production
- `npm run serve` - Serve built application locally
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container
- `npm run docker:compose` - Start with Docker Compose
- `npm run clean` - Clean build artifacts and dependencies
- `npm run fresh` - Clean install (clean + install)

### Development Workflow

1. **Initial Setup**
   ```bash
   ./scripts/setup.sh
   ```

2. **Start Development**
   ```bash
   npm start
   # or
   npm run dev
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Build for Testing**
   ```bash
   npm run build:dev
   npm run serve
   ```

5. **Deploy to Staging**
   ```bash
   npm run deploy:staging
   ```

### Project Structure

```
ai-governance-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ComplianceGauge.js
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   ├── ModelRegistry.js
│   │   ├── Navbar.js
│   │   └── OnboardForm.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── ModelContext.js
│   ├── config/
│   │   └── local.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── scripts/                       # Deployment scripts
│   ├── setup.sh
│   ├── build.sh
│   ├── deploy.sh
│   ├── create-eks-cluster.sh      # NEW - EKS cluster creation
│   ├── deploy-eks.sh              # NEW - EKS deployment
│   └── README.md
├── k8s/                           # NEW - Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── nginx-config.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   ├── pdb.yaml
│   ├── networkpolicy.yaml
│   └── servicemonitor.yaml
├── helm/                          # NEW - Helm charts
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       ├── configmap.yaml
│       ├── hpa.yaml
│       ├── namespace.yaml
│       └── _helpers.tpl
├── Dockerfile                     # Multi-stage Docker build
├── docker-compose.yml             # Base Docker Compose
├── docker-compose.prod.yml        # Production overrides
├── docker-compose.staging.yml     # Staging overrides
├── nginx.conf                     # Nginx configuration
├── .dockerignore                  # Docker build optimization
├── package.json
├── tailwind.config.js
├── README.md
└── EKS-DEPLOYMENT.md              # NEW - EKS deployment guide
```

### Key Components

#### Frontend Components
- **AuthContext** - Manages user authentication and session persistence
- **ModelContext** - Handles model data, CRUD operations, and compliance logic
- **Dashboard** - Main application view with role-based customization
- **ComplianceGauge** - Visual risk overview with statistics
- **ModelRegistry** - Comprehensive model management table
- **OnboardForm** - New model creation with risk assessment

#### Deployment Components
- **Docker**: Multi-stage builds with Nginx for production
- **Kubernetes**: Complete K8s manifests for EKS deployment
- **Helm**: Templated Kubernetes deployments with environment-specific values
- **Scripts**: Automated deployment and cluster management tools

#### Infrastructure Features
- **Auto-scaling**: HPA for pods, Cluster Autoscaler for nodes
- **Load Balancing**: AWS ALB with SSL/TLS termination
- **Monitoring**: Prometheus/Grafana integration, health checks
- **Security**: Network policies, RBAC, pod security standards

## 🔒 Security & Data

### Demo Mode
- Uses localStorage for data persistence
- No external API calls or database connections
- All data is stored locally in the browser
- Session management through localStorage tokens

### Production Considerations
For production deployment, consider:
- Replace localStorage with proper database (PostgreSQL, MongoDB)
- Implement real authentication system (Firebase, Auth0, custom)
- Add API layer for data management
- Implement proper security measures (HTTPS, CSRF protection)
- Add audit logging and compliance reporting

## 🎨 Customization

### Styling
- Built with Tailwind CSS for easy customization
- Custom color scheme defined in `tailwind.config.js`
- Responsive design works on desktop, tablet, and mobile
- Custom gauge styles in `index.css`

### Adding New Risk Categories
Update the `classifyRisk` function in `ModelContext.js` to add new use cases or modify risk classifications.

### Role Permissions
Modify role-based logic in components by checking `userProfile.role` in the AuthContext.

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   # Or start on different port
   PORT=3001 npm start
   ```

2. **Dependencies Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Browser Cache Issues**
   - Clear browser localStorage
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Setup
```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR_USERNAME/ai-governance-dashboard.git
cd ai-governance-dashboard
./scripts/setup.sh
```

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and add tests
3. Run tests: `npm test`
4. Build and verify: `npm run build`
5. Commit with conventional commits: `git commit -m "feat: add new feature"`
6. Push and create a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or support:
- 📋 [Create an issue](https://github.com/your-username/ai-governance-dashboard/issues/new/choose)
- 💬 [Start a discussion](https://github.com/your-username/ai-governance-dashboard/discussions)
- 📖 Check our [documentation](https://github.com/your-username/ai-governance-dashboard/wiki)

## 🚀 Quick Reference

### Essential Commands
```bash
# Setup (run once)
./scripts/setup.sh

# Development
npm start

# Production deployment (Docker)
./scripts/deploy.sh production

# EKS deployment
./scripts/create-eks-cluster.sh     # One-time cluster setup
./scripts/deploy-eks.sh production  # Deploy application

# Docker deployment
docker-compose up -d

# Static build
./scripts/build.sh production
```

### Demo Credentials
- **Developer**: developer@demo.com / demo123
- **DPO**: dpo@demo.com / demo123  
- **Executive**: executive@demo.com / demo123

### Key URLs
- **Development**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Traefik Dashboard**: http://localhost:8080 (Docker Compose)
- **EKS Application**: Check `kubectl get ingress -n ai-governance`

## 🎭 Demo Presentation

### Quick Demo Setup
```bash
# Clone and start the demo
git clone https://github.com/your-username/ai-governance-dashboard.git
cd ai-governance-dashboard
npm install
npm start

# Navigate to http://localhost:3000
# Use demo credentials and click "Take Tour"
```

### Demo Flow (15-20 minutes)
1. **Executive Overview** (3 min) - Login as executive, show compliance metrics and export
2. **DPO Workflow** (5 min) - Login as DPO, review and approve models  
3. **Developer Experience** (4 min) - Login as developer, onboard new model
4. **Interactive Tour** (3 min) - Use guided tour to highlight features
5. **Technical Architecture** (2 min) - Show deployment options and scalability
6. **Q&A** (3 min) - Address questions and discuss next steps

### Demo Highlights
- **67% compliance rate** with modern AI model distribution
- **Role-based workflows** showing different user perspectives  
- **Real-time updates** demonstrating live collaboration
- **Professional export** capabilities for executive reporting
- **Interactive tour** for guided feature discovery
- **Production-ready** deployment options (Docker, EKS, static)
- **Modern AI Models** featuring Llama3, Mistral, Qwen2, DeepSeek, and Phi3

### Demo Credentials Quick Reference
- **Executive**: executive@demo.com / demo123 (compliance overview + export)
- **DPO**: dpo@demo.com / demo123 (model approval + compliance updates)
- **Developer**: developer@demo.com / demo123 (model onboarding + registry view)

## 📋 **Complete Demo Guide**: See [DEMO_PRESENTATION_GUIDE.md](./DEMO_PRESENTATION_GUIDE.md) for detailed presentation flow and talking points.

## 💼 **Business Pitches**

### For Decision Makers
- **📊 Executive Pitch**: [Business case, ROI, and strategic value](./EXECUTIVE_PITCH.md)
- **🔧 Technical Pitch**: [Architecture, implementation, and integration](./TECHNICAL_PITCH.md)

Both pitches include updated content highlighting modern AI model support (Llama3, Mistral, Qwen2, DeepSeek-Coder, Phi3) and comprehensive governance capabilities.

### Important Files & Directories
- `scripts/` - Deployment and build scripts
- `k8s/` - Kubernetes manifests for EKS
- `helm/` - Helm charts for templated deployments
- `docker-compose.yml` - Container orchestration
- `.env.local` - Local environment variables
- `build/` - Production build output
- `EKS-DEPLOYMENT.md` - Comprehensive EKS deployment guide
- `CONTRIBUTING.md` - Contribution guidelines
- `DEMO_PRESENTATION_GUIDE.md` - **NEW** - Complete demo presentation guide
- `.github/` - GitHub Actions workflows and templates

### Repository Features
- 🔄 **CI/CD Pipeline** - Automated testing, building, and deployment
- 🐳 **Docker Ready** - Multi-stage builds with production optimization
- ☸️ **Kubernetes Native** - Complete EKS deployment with Helm charts
- 📊 **Monitoring** - Prometheus/Grafana integration ready
- 🔒 **Security** - Automated vulnerability scanning and best practices
- 📚 **Documentation** - Comprehensive guides and API documentation
- 🎭 **Demo Ready** - **NEW** - Interactive tour, realistic data, presentation guide
- 🤝 **Community** - Issue templates, contributing guidelines, and supportue templates, PR guidelines, and contribution docs

---

**Built with ❤️ for AI Governance and Compliance**

> **🎯 Ready for Demo**: Professional presentation platform with interactive tour, realistic data, and comprehensive documentation

⭐ **Star this repository** if you find it helpful!

🔗 **Share** with your team and contribute to the AI governance community!

📋 **Demo Guide**: Check out [DEMO_PRESENTATION_GUIDE.md](./DEMO_PRESENTATION_GUIDE.md) for complete presentation instructions