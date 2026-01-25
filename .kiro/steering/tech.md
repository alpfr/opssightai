# Technology Stack and Build System

## Frontend Technologies

### AI Governance Dashboard
- **Framework**: React 18.2.0 with Create React App
- **Routing**: React Router DOM 6.8.0
- **Styling**: Tailwind CSS 3.4.0 with PostCSS and Autoprefixer
- **Charts**: Recharts 2.8.0 for data visualization
- **Icons**: Heroicons 2.0.18
- **Authentication**: Firebase 10.7.1 (with local storage fallback for demo)
- **Testing**: Jest with React Testing Library

### AI Compliance Platform Frontend
- **Framework**: React 18.2.0
- **UI Components**: Material-UI (@mui/material 5.14.0)
- **HTTP Client**: Axios 1.6.0
- **Charts**: Recharts 2.8.0
- **Styling**: Material-UI with Emotion

## Backend Technologies

### AI Compliance Platform Backend
- **Framework**: FastAPI 0.115.6
- **ASGI Server**: Uvicorn 0.32.1 with standard extras
- **Authentication**: PyJWT 2.10.1 with python-multipart
- **Database**: SQLite (built-in) for development, PostgreSQL for production
- **Data Validation**: Pydantic 2.10.5
- **HTTP Client**: httpx 0.28.1
- **Testing**: pytest 8.3.4 with pytest-asyncio
- **Production Server**: Gunicorn 23.0.0

## Infrastructure and Deployment

### Containerization
- **Docker**: Multi-stage builds with Alpine Linux base images
- **Docker Compose**: Orchestration for local development and staging
- **Nginx**: Reverse proxy and static file serving

### Cloud Infrastructure (AWS)
- **Compute**: EC2, Lambda, ECS/Fargate
- **Storage**: S3 with cross-region replication
- **Networking**: VPC, ALB/NLB, CloudFront
- **Monitoring**: CloudWatch, X-Ray tracing
- **Security**: IAM roles, KMS encryption, VPC endpoints
- **Orchestration**: EKS (Kubernetes) with Helm charts

### AWS Services Patterns
- **CloudFormation**: Infrastructure as Code with comprehensive templates
- **Lambda**: Serverless functions for data processing and integrations
- **API Gateway**: RESTful API management with resource policies
- **CloudTrail**: Audit logging with Splunk integration
- **Transfer Family**: SFTP services with S3 backend

## Common Commands

### Development
```bash
# AI Governance Dashboard
npm install
npm start                    # Development server (port 3000)
npm run build               # Production build
npm test                    # Run tests

# AI Compliance Platform
cd backend
pip install -r requirements.txt
uvicorn main:app --reload   # Backend server (port 8000)

cd frontend
npm install
npm start                   # Frontend server (port 3000)
```

### Docker Deployment
```bash
# Single container
docker build -t app-name .
docker run -p 3000:80 app-name

# Docker Compose
docker-compose up -d        # Start all services
docker-compose logs -f      # View logs
docker-compose down         # Stop services
```

### AWS Deployment
```bash
# CloudFormation
aws cloudformation create-stack --stack-name my-stack --template-body file://template.yml

# EKS
kubectl apply -f k8s/
helm install app-name ./helm/

# Lambda
aws lambda create-function --function-name my-function --zip-file fileb://function.zip
```

## Development Tools

### Code Quality
- **ESLint**: JavaScript/React linting with react-app configuration
- **Prettier**: Code formatting (implied by project structure)
- **Jest**: Unit testing framework
- **pytest**: Python testing framework

### Build Tools
- **Webpack**: Bundling via Create React App
- **Babel**: JavaScript transpilation
- **PostCSS**: CSS processing with Tailwind

### Deployment Scripts
- **setup.sh**: Initial project setup and dependency installation
- **build.sh**: Environment-specific builds
- **deploy.sh**: Multi-environment deployment automation
- **create-eks-cluster.sh**: EKS cluster provisioning
- **deploy-eks.sh**: Kubernetes deployment automation

## Environment Configuration

### Development
- Hot reloading enabled
- Source maps for debugging
- Local storage for demo data
- CORS enabled for cross-origin requests

### Production
- Optimized builds with minification
- SSL/TLS termination
- Health checks and monitoring
- Auto-scaling configurations
- Security headers and policies