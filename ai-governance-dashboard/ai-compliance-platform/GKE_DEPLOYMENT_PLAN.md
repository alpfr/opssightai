# AI Compliance Platform - GKE Deployment Plan

**Date**: February 9, 2026  
**Target Platform**: Google Kubernetes Engine (GKE)  
**Current Status**: Running locally, ready for cloud deployment

---

## 📋 Current Application Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Server**: Uvicorn ASGI
- **Database**: SQLite (will migrate to PostgreSQL for production)
- **Authentication**: JWT-based
- **Port**: 8000

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **Charts**: Recharts
- **Build Tool**: React Scripts (Create React App)
- **Port**: 3000

### Features
- AI Compliance Assessment System
- LLM Management (7 AI models)
- Executive Dashboard
- Guardrail System
- Audit Trail
- Multi-industry support (Financial, Healthcare, Automotive, Government)

---

## 🎯 Deployment Strategy

### Phase 1: Containerization (Docker)
1. ✅ Backend Dockerfile exists
2. ✅ Frontend Dockerfile exists
3. ⚠️ Need production-optimized Dockerfiles
4. ⚠️ Need Nginx configuration for frontend
5. ⚠️ Need to migrate from SQLite to PostgreSQL

### Phase 2: Kubernetes Configuration (Helm)
1. Create Helm chart structure
2. Create Kubernetes manifests:
   - Namespace
   - ConfigMap (environment variables)
   - Secrets (JWT secret, database credentials)
   - PostgreSQL StatefulSet
   - Backend Deployment
   - Frontend Deployment
   - Services (ClusterIP)
   - Ingress (Load Balancer)
   - HPA (Horizontal Pod Autoscaler)

### Phase 3: Database Migration
1. Migrate from SQLite to PostgreSQL
2. Update backend database connection
3. Create database initialization scripts
4. Migrate existing data (if needed)

### Phase 4: Deployment
1. Build Docker images for linux/amd64
2. Push images to Google Container Registry (GCR)
3. Deploy to existing GKE cluster (sermon-slicer-cluster)
4. Configure DNS and SSL

---

## 🏗️ Proposed Architecture

```
Internet
    ↓
Google Cloud Load Balancer (HTTPS)
    ↓
Ingress (opssightai.com/compliance or compliance.opssightai.com)
    ↓
    ├─→ Frontend Service (ClusterIP) → Frontend Pods (2 replicas)
    │                                      ↓
    │                                   Nginx + React
    │
    └─→ Backend Service (ClusterIP) → Backend Pods (3 replicas)
                                          ↓
                                    FastAPI + Uvicorn
                                          ↓
                                    PostgreSQL Service
                                          ↓
                                    PostgreSQL StatefulSet (1 replica)
```

---

## 📦 Required Changes

### 1. Production Dockerfiles

#### Backend Dockerfile (Production)
```dockerfile
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Copy application code
COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile (Production)
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build for production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create nginx cache directories
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chmod -R 777 /var/cache/nginx

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Nginx Configuration

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location /api/ {
        proxy_pass http://ai-compliance-backend:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Database Migration

#### Update Backend for PostgreSQL

**requirements.txt** (add):
```
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
```

**Database connection** (update main.py):
```python
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@ai-compliance-db:5432/ai_compliance"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### 4. Environment Variables

#### Backend ConfigMap
```yaml
ENVIRONMENT: production
LOG_LEVEL: INFO
CORS_ORIGINS: https://compliance.opssightai.com,https://opssightai.com
DATABASE_HOST: ai-compliance-db
DATABASE_PORT: "5432"
DATABASE_NAME: ai_compliance
```

#### Backend Secrets
```yaml
SECRET_KEY: <jwt-secret-key>
DATABASE_USER: postgres
DATABASE_PASSWORD: <secure-password>
```

---

## 📊 Resource Requirements

### Minimum Deployment
| Component | Replicas | CPU | Memory | Storage |
|-----------|----------|-----|--------|---------|
| Frontend  | 2        | 100m-500m | 128Mi-512Mi | - |
| Backend   | 3        | 200m-1000m | 256Mi-1Gi | - |
| PostgreSQL| 1        | 500m-2000m | 1Gi-4Gi | 20Gi |
| **Total** | **6 pods** | **~1.5 cores** | **~2.5Gi** | **20Gi** |

**Can deploy to existing cluster**: sermon-slicer-cluster (2× n1-standard-2)

### Production Deployment
| Component | Replicas | CPU | Memory | Storage |
|-----------|----------|-----|--------|---------|
| Frontend  | 3-10     | 500m-1000m | 512Mi-1Gi | - |
| Backend   | 5-20     | 1000m-2000m | 1Gi-2Gi | - |
| PostgreSQL| 1        | 2000m-4000m | 4Gi-8Gi | 50Gi |

---

## 🚀 Deployment Options

### Option 1: Subdomain (Recommended)
- **URL**: https://compliance.opssightai.com
- **Pros**: Clean separation, easy SSL
- **Cons**: Requires additional DNS record

### Option 2: Path-based
- **URL**: https://opssightai.com/compliance
- **Pros**: Single domain, shared SSL
- **Cons**: More complex routing

### Option 3: Separate Domain
- **URL**: https://aicomplianceplatform.com
- **Pros**: Complete independence
- **Cons**: Requires new domain, separate SSL

---

## 📋 Implementation Checklist

### Phase 1: Preparation
- [ ] Create production Dockerfiles
- [ ] Create Nginx configuration
- [ ] Update backend for PostgreSQL
- [ ] Create database initialization scripts
- [ ] Test locally with Docker Compose

### Phase 2: Kubernetes Configuration
- [ ] Create Helm chart structure
- [ ] Create all Kubernetes manifests
- [ ] Configure environment variables
- [ ] Set up secrets management
- [ ] Configure ingress rules

### Phase 3: Database Setup
- [ ] Deploy PostgreSQL to GKE
- [ ] Initialize database schema
- [ ] Migrate data from SQLite (if needed)
- [ ] Test database connectivity

### Phase 4: Application Deployment
- [ ] Build Docker images for linux/amd64
- [ ] Push images to GCR
- [ ] Deploy to GKE
- [ ] Verify all pods running
- [ ] Test application functionality

### Phase 5: DNS and SSL
- [ ] Configure DNS records
- [ ] Set up SSL certificate
- [ ] Test HTTPS access
- [ ] Configure HTTP→HTTPS redirect

### Phase 6: Post-Deployment
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all features
- [ ] Update documentation

---

## ⏱️ Estimated Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1 | 2-3 hours | Create production configs |
| Phase 2 | 2-3 hours | Kubernetes manifests |
| Phase 3 | 1-2 hours | Database setup |
| Phase 4 | 1-2 hours | Deploy application |
| Phase 5 | 1-2 hours | DNS and SSL |
| Phase 6 | 1 hour | Testing and docs |
| **Total** | **8-13 hours** | **Complete deployment** |

---

## 💰 Cost Estimate

### Using Existing Cluster (sermon-slicer-cluster)
- **Current**: OpsSightAI (6 pods)
- **Add**: AI Compliance (6 pods)
- **Total**: 12 pods on 2× n1-standard-2 nodes
- **Additional Cost**: $0 (fits in existing cluster)

### Separate Cluster
- **Cluster**: 3× n1-standard-2 nodes
- **Cost**: ~$218/month
- **Total with OpsSightAI**: ~$436/month

---

## 🎯 Recommended Approach

### Deploy to Existing Cluster
1. **Use existing sermon-slicer-cluster**
2. **Deploy in separate namespace**: `ai-compliance`
3. **Use subdomain**: `compliance.opssightai.com`
4. **Share SSL certificate**: Add to existing managed certificate
5. **Leverage existing infrastructure**: Same monitoring, backups

### Benefits
- ✅ Zero additional infrastructure cost
- ✅ Faster deployment (cluster already exists)
- ✅ Shared monitoring and management
- ✅ Single SSL certificate for both apps
- ✅ Unified deployment pipeline

---

## 🔄 Next Steps

Would you like me to:

1. **Start Phase 1**: Create production Dockerfiles and configurations?
2. **Create Helm Chart**: Build complete Kubernetes manifests?
3. **Deploy to GKE**: Execute full deployment to existing cluster?
4. **All of the above**: Complete end-to-end deployment?

Let me know and I'll proceed with the deployment! 🚀
