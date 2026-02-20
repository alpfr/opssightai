# MedAssist - AI-Powered Healthcare Platform

A comprehensive telemedicine and healthcare management platform combining AI-powered health assistance with provider onboarding, patient management, and anonymous care options.

> **🎯 Production-Ready**: Deployed on Azure Kubernetes Service (AKS) with full mobile responsiveness

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/kubernetes-AKS-326CE5)](https://azure.microsoft.com/en-us/services/kubernetes-service/)

## 🚀 Live Deployment

**Production URL**: http://13.92.69.173  
**Status**: Fully operational on Azure AKS  
**Platform**: Azure Kubernetes Service (AKS)

### Available Services

| Service | URL | Description |
|---------|-----|-------------|
| **Patient API** | http://13.92.69.173/api/health | Backend REST API with health endpoints |
| **Admin UI** | http://13.92.69.173/admin | Administrative dashboard for patient management |
| **Provider Dashboard** | http://13.92.69.173/provider | Clinical dashboard for healthcare providers |
| **Patient Portal** | http://13.92.69.173/patient | Consumer-facing portal with AI assistant |
| **Anonymous Portal** | http://13.92.69.173/anonymous | Privacy-focused care with state compliance |
| **Provider Onboarding** | http://13.92.69.173/onboarding | Self-service provider registration |

## ✨ Key Features

### 🤖 AI Health Assistant
- Real-time health question answering
- Symptom checking and analysis
- Medication information and interactions
- Personalized health recommendations
- 24/7 availability

### 👨‍⚕️ Provider Features
- Clinical dashboard with patient roster
- SOAP note documentation
- Encounter management
- Prescription management
- Secure messaging

### 👤 Patient Features
- **Mobile-First Design**: Tab-based navigation optimized for mobile devices
- Unified health records access
- Appointment scheduling
- Medication tracking with reminders
- Secure document sharing
- AI-powered health insights
- **About Page**: Comprehensive platform information

### 🌍 Anonymous Care
- State-compliant anonymous access
- Sensitive health topic support (mental health, STDs, substance abuse)
- Configurable minimum information requirements
- Privacy-first architecture

### 💼 Provider Onboarding
- 5-step registration process
- NPI verification
- Credential upload (license, insurance, certifications)
- Subscription selection (Basic $99, Professional $249, Enterprise $499)
- Secure payment processing

## 🏗 Architecture

### Technology Stack

**Backend**
- FastAPI (Python 3.9+)
- In-memory data storage (MVP)
- RESTful API design
- Health check endpoints

**Frontend**
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design (mobile, tablet, desktop)
- Tab-based navigation for mobile UX
- Real-time API integration

**Infrastructure**
- Docker containerization
- Azure Kubernetes Service (AKS)
- NGINX Ingress Controller
- Azure Container Registry (ACR)
- LoadBalancer with public IP

### System Components

```
medassist/
├── patient-api/          # Backend REST API
│   ├── app/
│   │   └── main.py      # FastAPI application
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/            # Admin UI
│   ├── index.html
│   ├── Dockerfile
│   └── nginx.conf
├── provider-ui/         # Provider Dashboard
│   ├── index.html
│   ├── Dockerfile
│   └── nginx.conf
├── patient-portal/      # Patient Portal (with AI & About tab)
│   ├── index.html
│   ├── Dockerfile
│   └── nginx.conf
├── anonymous-portal/    # Anonymous Care Portal
│   ├── index.html
│   ├── Dockerfile
│   └── nginx.conf
├── provider-onboarding/ # Provider Registration
│   ├── index.html
│   ├── Dockerfile
│   └── nginx.conf
├── k8s/                 # Kubernetes manifests
│   ├── namespace.yaml
│   ├── *-deployment.yaml
│   └── ingress-temp.yaml
└── docker-compose.mvp.yml
```

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (for local development)
- Azure CLI (for AKS deployment)
- kubectl (for Kubernetes management)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medassist
   ```

2. **Start all services**
   ```bash
   docker-compose -f docker-compose.mvp.yml up -d
   ```

3. **Access the services**
   - Backend API: http://localhost:8001
   - Admin UI: http://localhost:8080
   - Provider Dashboard: http://localhost:8081
   - Patient Portal: http://localhost:8082
   - Anonymous Portal: http://localhost:8083
   - Provider Onboarding: http://localhost:8084

4. **Stop services**
   ```bash
   docker-compose -f docker-compose.mvp.yml down
   ```

### Testing the API

```bash
# Health check
curl http://localhost:8001/health

# List patients
curl http://localhost:8001/patients

# Create a patient
curl -X POST http://localhost:8001/patients \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-01-01",
    "email": "john.doe@example.com"
  }'
```

## ☸️ Azure AKS Deployment

### Deployment Scripts

The project includes automated deployment scripts:

| Script | Purpose |
|--------|---------|
| `deploy-to-aks.sh` | Initial AKS deployment |
| `deploy-to-aks-fixed.sh` | Fixed deployment with ARM64→AMD64 compatibility |

### Quick AKS Deployment

```bash
# Make script executable
chmod +x deploy-to-aks-fixed.sh

# Run deployment
./deploy-to-aks-fixed.sh
```

The script will:
1. Create Azure Resource Group
2. Create Azure Container Registry (ACR)
3. Create AKS cluster
4. Build Docker images for AMD64 platform
5. Push images to ACR
6. Deploy to AKS with NGINX Ingress
7. Configure LoadBalancer

### Manual AKS Deployment

```bash
# 1. Create resources
az group create --name medassist-rg --location eastus
az acr create --resource-group medassist-rg --name medassistacr --sku Basic
az aks create --resource-group medassist-rg --name medassist-aks-public \
  --node-count 2 --node-vm-size Standard_B2s --attach-acr medassistacr

# 2. Get credentials
az aks get-credentials --resource-group medassist-rg --name medassist-aks-public
az acr login --name medassistacr

# 3. Build and push images (ARM64 Mac compatibility)
docker buildx build --platform linux/amd64 -t medassistacr.azurecr.io/patient-api:latest ./patient-api
docker buildx build --platform linux/amd64 -t medassistacr.azurecr.io/medassist-frontend:latest ./frontend
docker buildx build --platform linux/amd64 -t medassistacr.azurecr.io/medassist-provider-ui:latest ./provider-ui
docker buildx build --platform linux/amd64 -t medassistacr.azurecr.io/patient-portal:latest ./patient-portal
docker buildx build --platform linux/amd64 -t medassistacr.azurecr.io/medassist-anonymous-portal:latest ./anonymous-portal
docker buildx build --platform linux/amd64 -t medassistacr.azurecr.io/medassist-provider-onboarding:latest ./provider-onboarding

docker push medassistacr.azurecr.io/patient-api:latest
docker push medassistacr.azurecr.io/medassist-frontend:latest
docker push medassistacr.azurecr.io/medassist-provider-ui:latest
docker push medassistacr.azurecr.io/patient-portal:latest
docker push medassistacr.azurecr.io/medassist-anonymous-portal:latest
docker push medassistacr.azurecr.io/medassist-provider-onboarding:latest

# 4. Deploy to AKS
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/patient-api-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/provider-ui-deployment.yaml
kubectl apply -f k8s/patient-portal-deployment.yaml
kubectl apply -f k8s/anonymous-portal-deployment.yaml
kubectl apply -f k8s/provider-onboarding-deployment.yaml

# 5. Install NGINX Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# 6. Apply Ingress
kubectl apply -f k8s/ingress-temp.yaml

# 7. Get LoadBalancer IP
kubectl get svc -n ingress-nginx
```

### Updating Deployments

```bash
# Rebuild and push updated image
docker buildx build --platform linux/amd64 -t medassistacr.azurecr.io/patient-portal:latest ./patient-portal
docker push medassistacr.azurecr.io/patient-portal:latest

# Restart deployment
kubectl rollout restart deployment/patient-portal -n medassist

# Check status
kubectl rollout status deployment/patient-portal -n medassist
```

### Monitoring AKS

```bash
# Check all pods
kubectl get pods -n medassist

# Check services
kubectl get svc -n medassist

# Check ingress
kubectl get ingress -n medassist

# View logs
kubectl logs -f deployment/patient-portal -n medassist

# Describe pod
kubectl describe pod <pod-name> -n medassist
```

## 📱 Patient Portal Features

### Tab-Based Navigation

The patient portal features a mobile-first tab-based design:

**Desktop Navigation**: Horizontal tabs at the top
**Mobile Navigation**: Fixed bottom navigation bar

### Available Tabs

1. **🏠 Home**
   - Health summary dashboard
   - Quick action buttons
   - Key metrics (last visit, next appointment, medications, health score)

2. **🤖 AI Assistant**
   - Real-time chat interface
   - Health question answering
   - Symptom checking
   - Medication information

3. **📅 Appointments**
   - Upcoming appointments list
   - Schedule new appointments
   - Primary care, specialist, urgent care, telehealth options

4. **💊 Medications**
   - Active prescriptions
   - Refill requests
   - Medication history
   - Drug interaction checker
   - Reminder settings

5. **📋 Records**
   - Medical records history
   - Lab results
   - Imaging reports
   - Download and share options

6. **👤 Profile**
   - Personal information
   - Insurance details
   - Emergency contacts
   - Settings (password, notifications, privacy, payments)
   - About MedAssist link

7. **ℹ️ About** (New!)
   - Platform overview and mission
   - Key features showcase
   - Core values
   - Contact and support information
   - Version and legal links

## 🌍 Anonymous Portal

### State-Specific Compliance

The anonymous portal supports state-specific minimum information requirements:

**Maryland Example**:
- Age range (required)
- ZIP code (required)
- Gender (optional)
- No full name or SSN required

**Supported States**:
- Maryland (MD)
- California (CA)
- New York (NY)
- Texas (TX)
- Florida (FL)

### Privacy Modes

1. **Fully Anonymous**: No personal information required
2. **Minimal Info (State Compliant)**: State-required minimum data
3. **Pseudonymous**: Optional identifier without real identity

## 💼 Provider Onboarding

### Registration Steps

1. **Registration**: NPI number and password
2. **Credentials Upload**: License, insurance, certifications
3. **Profile Creation**: Specialty, bio, experience
4. **Subscription Selection**: Choose plan tier
5. **Payment Processing**: Secure card entry

### Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Basic** | $99/month | • Basic profile listing<br>• Up to 50 patients<br>• Standard support |
| **Professional** | $249/month | • Featured profile<br>• Unlimited patients<br>• Priority support<br>• Analytics dashboard |
| **Enterprise** | $499/month | • Premium placement<br>• Multi-provider support<br>• Dedicated account manager<br>• Custom integrations |

## 🔧 Development

### Adding New Features

1. **Update the appropriate service** (patient-api, patient-portal, etc.)
2. **Test locally** with docker-compose
3. **Build for AMD64** platform (for AKS compatibility)
4. **Push to ACR**
5. **Restart deployment** in AKS

### Code Structure

**Backend (FastAPI)**:
```python
# patient-api/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(CORSMiddleware, ...)

# Define routes
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

**Frontend (HTML/JS)**:
```javascript
// Tab switching function
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
}
```

## 📊 Cost Estimation

### Azure AKS Monthly Costs

| Resource | Configuration | Monthly Cost |
|----------|--------------|--------------|
| **AKS Cluster** | 2 x Standard_B2s nodes | ~$60 |
| **Container Registry** | Basic tier | ~$5 |
| **LoadBalancer** | Public IP | ~$20 |
| **Total** | | **~$85/month** |

### Cost Optimization

- Use spot instances for non-production
- Scale down during off-hours
- Use Azure Reserved Instances for production
- Implement horizontal pod autoscaling

## 🔒 Security Considerations

### Current Implementation (MVP)

- In-memory data storage (not persistent)
- No authentication/authorization
- HTTP only (no HTTPS)
- Public LoadBalancer

### Production Recommendations

1. **Database**: Implement PostgreSQL or MongoDB
2. **Authentication**: Add OAuth2/JWT authentication
3. **HTTPS**: Configure SSL/TLS certificates
4. **Network Security**: Implement network policies
5. **Secrets Management**: Use Azure Key Vault
6. **HIPAA Compliance**: Implement audit logging and encryption
7. **API Rate Limiting**: Prevent abuse
8. **Input Validation**: Sanitize all user inputs

## 📚 API Documentation

### Patient API Endpoints

```
GET    /health              - Health check
GET    /patients            - List all patients
POST   /patients            - Create new patient
GET    /patients/{upi}      - Get patient by UPI
PUT    /patients/{upi}      - Update patient
DELETE /patients/{upi}      - Delete patient
```

### Request/Response Examples

**Create Patient**:
```json
POST /patients
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "email": "john.doe@example.com",
  "phone": "+1234567890"
}

Response: 201 Created
{
  "upi": "UPI-ABC123XYZ",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "created_at": "2026-02-19T10:30:00Z"
}
```

## 🐛 Troubleshooting

### Common Issues

**Pods not starting**:
```bash
kubectl describe pod <pod-name> -n medassist
kubectl logs <pod-name> -n medassist
```

**Image pull errors**:
```bash
# Verify ACR access
az acr login --name medassistacr

# Check image exists
az acr repository list --name medassistacr
```

**LoadBalancer pending**:
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check service
kubectl get svc -n ingress-nginx
```

**ARM64 vs AMD64 issues**:
```bash
# Always build for AMD64 on Mac
docker buildx build --platform linux/amd64 -t <image-name> .
```

## 📖 Additional Documentation

- [AKS Deployment Guide](./AKS_DEPLOYMENT_GUIDE.md)
- [AKS Deployment Success](./AKS_DEPLOYMENT_SUCCESS.md)
- [Demo Ready Guide](./DEMO_READY.md)
- [Sponsor Demo Checklist](./SPONSOR_DEMO_CHECKLIST.md)
- [Quick Reference](./QUICK_REFERENCE.txt)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- Azure for cloud infrastructure
- NGINX for ingress and web serving
- The open-source community

## 📞 Support

For questions or support:
- Email: support@medassist.health
- 24/7 Helpline: 1-800-MEDASSIST
- Website: www.medassist.health

---

**Version**: 1.0.0  
**Last Updated**: February 19, 2026  
**Status**: Production-Ready MVP
