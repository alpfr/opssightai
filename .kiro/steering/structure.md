# Project Organization and Folder Structure

## Repository Layout

This is a multi-project repository containing several AI governance and compliance applications along with supporting infrastructure code.

### Main Applications

```
ai-governance-dashboard/          # React-based AI governance dashboard
├── src/
│   ├── components/              # React components (Dashboard, Login, etc.)
│   ├── contexts/               # React contexts (AuthContext, ModelContext)
│   ├── config/                 # Configuration files
│   └── App.js                  # Main application component
├── public/                     # Static assets
├── scripts/                    # Deployment and build scripts
├── k8s/                       # Kubernetes manifests for EKS
├── helm/                      # Helm charts for templated deployments
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Container orchestration
└── package.json              # Node.js dependencies and scripts

ai-compliance-platform/          # Full-stack compliance platform
├── backend/                   # FastAPI backend
│   ├── main.py               # FastAPI application entry point
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile           # Backend container configuration
├── frontend/                 # React frontend
│   ├── src/                 # React application source
│   ├── package.json         # Frontend dependencies
│   └── Dockerfile          # Frontend container configuration
├── docker-compose.yml       # Multi-service orchestration
└── nginx.conf              # Reverse proxy configuration
```

### Infrastructure and Scripts

```
# CloudFormation Templates (AWS Infrastructure as Code)
oit-*.yml                       # Production CloudFormation templates
lambda-scripts/                 # Lambda function templates and scripts
terraform-scripts/              # Terraform infrastructure code (if present)

# Standalone Applications
anthropic-chatbot/              # Anthropic Claude chatbot implementation
clamav-lambda/                  # ClamAV antivirus scanning Lambda
elk-stack-*/                    # Elasticsearch/Kibana monitoring stacks
fastapi-*/                      # Various FastAPI applications
```

### Development and Configuration Files

```
.kiro/                          # Kiro IDE configuration
├── specs/                     # Feature specifications
│   └── ai-compliance-platform/ # Existing spec for compliance platform
└── steering/                  # Project steering documents (this directory)

.vscode/                       # VS Code configuration
.git/                         # Git repository metadata
```

## Naming Conventions

### Files and Directories
- **Kebab-case**: Used for directory names and configuration files (`ai-governance-dashboard`, `docker-compose.yml`)
- **PascalCase**: React components (`Dashboard.js`, `ModelRegistry.js`)
- **camelCase**: JavaScript variables and functions
- **snake_case**: Python files and variables
- **UPPER_CASE**: Environment variables and constants

### CloudFormation Templates
- **Pattern**: `{organization}-{environment}-{service}-{date}-cft-v{version}.yml`
- **Example**: `oit-lssp-prod-create-cloudwatch-dashboard-cft-v1.yml`
- **Prefixes**: 
  - `oit-` for organizational templates
  - Environment indicators: `dev`, `stg`, `prod`

### Docker and Kubernetes
- **Images**: Use lowercase with hyphens (`ai-governance-dashboard`)
- **Services**: Descriptive names matching application purpose
- **Namespaces**: Environment-based (`ai-governance`, `ai-compliance`)

## Component Organization

### React Applications
```
src/
├── components/                 # Reusable UI components
│   ├── Dashboard.js           # Main dashboard view
│   ├── ComplianceGauge.js     # Risk visualization component
│   ├── ModelRegistry.js       # Model management table
│   └── OnboardForm.js         # New model creation form
├── contexts/                  # React context providers
│   ├── AuthContext.js         # Authentication state management
│   └── ModelContext.js        # Model data and CRUD operations
├── config/                    # Configuration and constants
└── App.js                     # Root application component
```

### FastAPI Backend
```
backend/
├── main.py                    # FastAPI application and routes
├── models/                    # Database models (if using ORM)
├── routers/                   # API route modules
├── services/                  # Business logic services
├── repositories/              # Data access layer
└── requirements.txt           # Python dependencies
```

## Configuration Management

### Environment-Specific Files
- **Development**: `.env.local`, `docker-compose.yml`
- **Staging**: `docker-compose.staging.yml`, staging-specific configs
- **Production**: `docker-compose.prod.yml`, production environment variables

### Deployment Configurations
- **Docker**: Multi-stage Dockerfiles for optimized production builds
- **Kubernetes**: Separate manifests for different environments
- **Helm**: Templated deployments with values files per environment

## Best Practices

### Code Organization
- **Separation of Concerns**: Clear separation between UI components, business logic, and data access
- **Reusable Components**: Shared components in dedicated directories
- **Configuration Externalization**: Environment-specific settings in separate files
- **Infrastructure as Code**: All AWS resources defined in CloudFormation templates

### File Naming
- Use descriptive names that clearly indicate purpose
- Include version numbers in infrastructure templates
- Group related files in logical directories
- Maintain consistent naming patterns across similar file types

### Documentation
- README files in each major application directory
- Inline comments for complex business logic
- API documentation through FastAPI automatic generation
- Deployment guides for different environments