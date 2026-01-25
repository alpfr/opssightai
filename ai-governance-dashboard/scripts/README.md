# AI Governance Dashboard - Deployment Scripts

This directory contains comprehensive deployment scripts for the AI Governance Dashboard, supporting multiple environments and deployment methods including Docker, Docker Compose, static hosting, and **AWS EKS**.

## 📁 Scripts Overview

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup.sh` | Initial project setup | `./scripts/setup.sh` |
| **`ai-model-setup.sh`** | **NEW** - AI model configuration | `./scripts/ai-model-setup.sh [model] [env]` |
| **`validate-models.sh`** | **NEW** - Model validation | `./scripts/validate-models.sh [model]` |
| `build.sh` | Build for different environments | `./scripts/build.sh [environment]` |
| `deploy.sh` | Deploy using various methods | `./scripts/deploy.sh [environment] [options] [model]` |
| **`create-eks-cluster.sh`** | **NEW** - Create AWS EKS cluster | `./scripts/create-eks-cluster.sh [cluster-name] [region]` |
| **`deploy-eks.sh`** | **NEW** - Deploy to EKS | `./scripts/deploy-eks.sh [environment] [cluster] [region]` |

## 🤖 AI Model Support

The AI Governance Dashboard now includes comprehensive support for modern AI models:

### Supported Models

| Model | Provider | Use Cases | Risk Profile |
|-------|----------|-----------|--------------|
| **llama3** | Meta | Credit Scoring, Medical Diagnosis, Legal Decision | High-Risk |
| **mistral** | Mistral AI | Chatbot, Content Moderation, Sentiment Analysis | Limited Risk |
| **qwen2** | Alibaba | Fraud Detection, Translation, Multilingual Processing | Limited Risk |
| **deepseek-coder** | DeepSeek | Code Generation, Code Review, Code Assistant | Limited Risk |
| **phi3** | Microsoft | Recommendation, Search Enhancement, Analytics | Minimal Risk |

### AI Model Quick Start

```bash
# Setup all AI models
./scripts/ai-model-setup.sh all development

# Setup specific model
./scripts/ai-model-setup.sh llama3 production

# Validate model configuration
./scripts/validate-models.sh llama3

# Deploy with model support
./scripts/deploy.sh production false false llama3
```

## 🚀 Quick Start

### 1. Initial Setup
```bash
# Run once after cloning the repository
./scripts/setup.sh
```

### 2. Development
```bash
# Start development server
npm start

# Or use the script
npm run dev
```

### 3. Production Deployment Options

#### Docker Compose (Recommended for VPS/Server)
```bash
# Build and deploy in one command
./scripts/deploy.sh production
```

#### AWS EKS (Recommended for Enterprise/Cloud)
```bash
# Create EKS cluster (one-time setup, 15-20 minutes)
./scripts/create-eks-cluster.sh

# Deploy application (5-10 minutes)
./scripts/deploy-eks.sh production
```

#### Static Hosting (Recommended for CDN/Edge)
```bash
# Build for static hosting
./scripts/build.sh production
# Then upload 'build/' directory to your hosting provider
```

## 📋 Detailed Script Documentation

### setup.sh
**Purpose**: Initial project configuration and environment setup with AI model support

**Features**:
- ✅ System requirements check (Node.js, npm, Docker, Git)
- ✅ Dependency installation
- ✅ Development environment configuration
- ✅ **AI model configuration setup**
- ✅ Git hooks setup (pre-commit linting and testing)
- ✅ VS Code configuration
- ✅ Additional npm scripts

**Usage**:
```bash
./scripts/setup.sh
```

**What it creates**:
- `.env.local` - Local environment variables
- `.env.[model]` - Model-specific configurations
- `.vscode/` - VS Code settings and extensions
- `test-data/[model]/` - Model-specific test data
- `docs/compliance/[model]/` - Compliance documentation
- Git pre-commit hooks
- Additional npm scripts in package.json

### ai-model-setup.sh ✨ NEW
**Purpose**: Configure and setup specific AI models with compliance and risk assessment

**Supported Models**: llama3, mistral, qwen2, deepseek-coder, phi3

**Features**:
- ✅ Model-specific environment configuration
- ✅ Use case and risk profile mapping
- ✅ Test data generation
- ✅ Compliance documentation
- ✅ Performance optimization
- ✅ Monitoring setup

**Usage**:
```bash
# Setup all models
./scripts/ai-model-setup.sh all development

# Setup specific model
./scripts/ai-model-setup.sh llama3 production
./scripts/ai-model-setup.sh mistral staging

# Get help
./scripts/ai-model-setup.sh help
```

**What it creates**:
- `.env.[model]` - Model-specific environment variables
- `test-data/[model]/sample-models.json` - Test data
- `docs/compliance/[model]/README.md` - Compliance guide
- `monitoring/[model]/metrics.json` - Monitoring config
- `webpack.[model].config.js` - Performance optimization

### validate-models.sh ✨ NEW
**Purpose**: Validate AI model configurations and integration

**Features**:
- ✅ Configuration validation
- ✅ Use case mapping verification
- ✅ Risk classification testing
- ✅ Integration testing
- ✅ Performance validation
- ✅ Security checks

**Usage**:
```bash
# Validate all models
./scripts/validate-models.sh all

# Validate specific model
./scripts/validate-models.sh llama3

# Get help
./scripts/validate-models.sh help
```

**Validation Checks**:
- Environment file validation
- Test data JSON validation
- Use case mapping verification
- Risk classification logic
- Build integration testing
- Performance configuration
- Security measures

### build.sh
**Purpose**: Build the application for different environments

**Environments**:
- `development` - Development build with source maps
- `staging` - Staging build with source maps and optimizations
- `production` - Production build fully optimized

**Features**:
- ✅ Environment-specific configuration
- ✅ Dependency installation and updates
- ✅ Linting and testing
- ✅ Bundle size analysis
- ✅ Build optimization (compression, caching headers)
- ✅ Build reports and documentation

**Usage**:
```bash
# Production build (default)
./scripts/build.sh

# Specific environment
./scripts/build.sh production
./scripts/build.sh staging
./scripts/build.sh development
```

**Output**:
- `build/` - Built application
- `build/build-report.json` - Machine-readable build info
- `build/BUILD_INFO.txt` - Human-readable build info
- `build/.htaccess` - Apache server configuration

### deploy.sh
**Purpose**: Deploy the application using various methods with AI model support

**Deployment Methods**:
- 🐳 **Docker** - Containerized deployment
- 🐙 **Docker Compose** - Multi-service deployment with reverse proxy
- 📁 **Static** - Static file deployment (Netlify, Vercel, S3, etc.)

**Features**:
- ✅ Prerequisites checking
- ✅ **AI model configuration support**
- ✅ Automated testing
- ✅ Multi-environment support
- ✅ Health checks
- ✅ Cleanup and optimization
- ✅ Deployment reporting

**Usage**:
```bash
# Full deployment with model support
./scripts/deploy.sh production false false llama3

# Build only (no deployment)
./scripts/deploy.sh production true false mistral

# Skip tests with specific model
./scripts/deploy.sh production false true phi3

# Development deployment
./scripts/deploy.sh development false false all
```

**Parameters**:
1. `environment` - Target environment (development|staging|production)
2. `build-only` - Only build, don't deploy (true|false)
3. `skip-tests` - Skip running tests (true|false)
4. `model-type` - AI model type (llama3|mistral|qwen2|deepseek-coder|phi3|all)

## ☸️ AWS EKS Deployment

### create-eks-cluster.sh
**Purpose**: Create and configure AWS EKS cluster for production deployment

**Features**:
- ✅ Complete EKS cluster setup with managed node groups
- ✅ Multi-AZ deployment across 3 availability zones
- ✅ VPC and subnet configuration with public/private subnets
- ✅ IAM roles and service accounts with OIDC provider
- ✅ Essential add-ons (ALB Controller, Cluster Autoscaler, Metrics Server)
- ✅ ECR repository creation for container images
- ✅ Optional monitoring stack (Prometheus/Grafana)
- ✅ Security best practices and network policies

**Prerequisites**:
- AWS CLI configured with appropriate permissions
- eksctl, kubectl, Helm installed
- EKS, EC2, IAM, VPC, CloudFormation permissions

**Usage**:
```bash
# Create cluster with default settings
./scripts/create-eks-cluster.sh

# Create cluster with custom name and region
./scripts/create-eks-cluster.sh my-cluster us-east-1

# Get help
./scripts/create-eks-cluster.sh help
```

**What it creates**:
- EKS cluster with Kubernetes 1.28
- Managed node group (t3.medium, 2-10 nodes)
- VPC with public/private subnets
- IAM roles and service accounts
- AWS Load Balancer Controller
- Cluster Autoscaler
- ECR repository
- Optional monitoring stack

### deploy-eks.sh
**Purpose**: Deploy AI Governance Dashboard to existing EKS cluster

**Features**:
- ✅ Automated Docker image build and push to ECR
- ✅ Kubernetes deployment with Helm or kubectl
- ✅ Environment-specific configurations
- ✅ Auto-scaling setup (HPA + Cluster Autoscaler)
- ✅ Load balancer and ingress configuration
- ✅ Health checks and monitoring
- ✅ Deployment verification and rollback support

**Usage**:
```bash
# Deploy to production
./scripts/deploy-eks.sh production

# Deploy to specific cluster and region
./scripts/deploy-eks.sh production my-cluster us-east-1

# Dry run (show what would be deployed)
./scripts/deploy-eks.sh production my-cluster us-west-2 true

# Get help
./scripts/deploy-eks.sh help
```

**Parameters**:
1. `environment` - Target environment (development|staging|production)
2. `cluster-name` - EKS cluster name (default: ai-governance-cluster)
3. `region` - AWS region (default: us-west-2)
4. `dry-run` - Dry run mode (true|false)

**Deployment Methods**:
- **Helm** (preferred): Templated deployment with values files
- **kubectl**: Direct Kubernetes manifest deployment

## 🐳 Docker Deployment

### Single Container
```bash
# Build and run with Docker
docker build -t ai-governance-dashboard .
docker run -p 3000:80 ai-governance-dashboard
```

### Docker Compose
```bash
# Development
docker-compose up -d

# Staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Production with SSL
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Docker Compose Services

| Service | Purpose | Ports |
|---------|---------|-------|
| `ai-governance-dashboard` | Main application | 3000:80 |
| `traefik` | Reverse proxy & SSL | 80:80, 443:443 |
| `watchtower` | Auto-updates (staging) | - |

## 🌐 Static Deployment

### Build for Static Hosting
```bash
# Create optimized build
./scripts/build.sh production

# Upload contents of 'build/' directory to:
# - Netlify: Drag & drop or Git integration
# - Vercel: Git integration or CLI
# - AWS S3: aws s3 sync build/ s3://your-bucket/
# - GitHub Pages: Copy to gh-pages branch
```

### Server Configuration

#### Nginx
```nginx
server {
    listen 80;
    root /path/to/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Apache (.htaccess included in build)
The build script automatically creates `.htaccess` with:
- React Router support
- Compression settings
- Cache headers
- Security headers

## 📊 Environment Configuration

### Development
- Source maps enabled
- Hot reloading
- Debug information
- Local storage for demo data

### Staging
- Source maps enabled
- Production optimizations
- Testing environment
- Auto-deployment with Watchtower

### Production
- Fully optimized build
- No source maps
- SSL/TLS support
- Health checks and monitoring
- Load balancing ready

## 🔧 Customization

### Adding New Environments
1. Update `build.sh` environment cases
2. Create new Docker Compose override file
3. Add environment-specific variables

### Custom Deployment Methods
Extend `deploy.sh` with new deployment functions:
```bash
deploy_custom() {
    echo "Custom deployment logic here"
    # Your deployment code
}
```

### Environment Variables
Create environment-specific `.env` files:
- `.env.local` - Local development
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9

# Use different port
PORT=3001 npm start
```

#### Docker Issues
```bash
# Clean Docker system
docker system prune -a

# Rebuild without cache
docker build --no-cache -t ai-governance-dashboard .
```

#### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

#### Build Failures
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

## 📈 Monitoring & Health Checks

### Health Check Endpoints
- `/health` - Application health status
- Docker health checks included
- Traefik dashboard (development): http://localhost:8080

### Logs
```bash
# Docker logs
docker logs ai-governance-dashboard

# Docker Compose logs
docker-compose logs -f
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Update default domain in `docker-compose.prod.yml`
- [ ] Configure SSL certificates
- [ ] Set up proper authentication (replace demo system)
- [ ] Configure CORS policies
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### Environment Variables
Never commit sensitive data. Use:
- Docker secrets for production
- Environment-specific `.env` files
- CI/CD pipeline variables

## 📚 Additional Resources

- [Main README](../README.md) - Complete project documentation
- [EKS Deployment Guide](../EKS-DEPLOYMENT.md) - Comprehensive EKS deployment instructions
- [EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [eksctl Documentation](https://eksctl.io/)

## 📁 Related Files and Directories

### Kubernetes Manifests (`../k8s/`)
- `namespace.yaml` - Namespace, resource quotas, and limits
- `configmap.yaml` - Application configuration
- `nginx-config.yaml` - Nginx server configuration
- `deployment.yaml` - Application deployment with security context
- `service.yaml` - ClusterIP and LoadBalancer services
- `ingress.yaml` - ALB ingress with SSL/TLS
- `hpa.yaml` - Horizontal Pod Autoscaler
- `pdb.yaml` - Pod Disruption Budget
- `networkpolicy.yaml` - Network security policies
- `servicemonitor.yaml` - Prometheus monitoring

### Helm Charts (`../helm/`)
- `Chart.yaml` - Helm chart metadata
- `values.yaml` - Default configuration values
- `templates/` - Kubernetes resource templates
  - `deployment.yaml` - Templated deployment
  - `service.yaml` - Templated service
  - `ingress.yaml` - Templated ingress
  - `configmap.yaml` - Templated configuration
  - `hpa.yaml` - Templated autoscaler
  - `namespace.yaml` - Templated namespace
  - `_helpers.tpl` - Template helpers

### Docker Files
- `../Dockerfile` - Multi-stage production build
- `../docker-compose.yml` - Base compose configuration
- `../docker-compose.prod.yml` - Production overrides
- `../docker-compose.staging.yml` - Staging overrides
- `../nginx.conf` - Production Nginx configuration
- `../.dockerignore` - Docker build optimization

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review Docker/container logs or Kubernetes pod logs
3. Verify system requirements and AWS permissions
4. Check the comprehensive [EKS Deployment Guide](../EKS-DEPLOYMENT.md) for EKS-specific issues
5. Open an issue with deployment details and logs

### EKS-Specific Support
- Check cluster status: `kubectl cluster-info`
- View pod logs: `kubectl logs -f deployment/ai-governance-dashboard -n ai-governance`
- Check ingress: `kubectl get ingress -n ai-governance`
- Verify AWS Load Balancer Controller: `kubectl logs -n kube-system deployment/aws-load-balancer-controller`

---

**Happy Deploying! 🚀**