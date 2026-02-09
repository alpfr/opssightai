# AI Compliance Platform - GKE Deployment Status

**Date**: February 9, 2026  
**Status**: 🟡 **READY FOR DEPLOYMENT**  
**Target**: sermon-slicer-cluster (GKE)

---

## ✅ Phase 1: COMPLETE - Production Configurations Created

### Docker Images
- ✅ **Backend Dockerfile** (`backend/Dockerfile.prod`)
  - Multi-stage build with Python 3.11
  - PostgreSQL support
  - Non-root user (UID 1001)
  - Health checks enabled
  - Production-optimized

- ✅ **Frontend Dockerfile** (`frontend/Dockerfile.prod`)
  - Multi-stage build with Node 18
  - Nginx-based serving
  - Production build optimization
  - Health checks enabled

- ✅ **Nginx Configuration** (`frontend/nginx.prod.conf`)
  - API proxy to backend
  - Gzip compression
  - Security headers
  - React Router support
  - Static asset caching

### Database
- ✅ **PostgreSQL Migration** (`database/init-db.sql`)
  - Complete schema with 10 tables
  - UUID support
  - Indexes for performance
  - Default admin/inspector users
  - 7 AI models pre-loaded

- ✅ **Production Requirements** (`backend/requirements.prod.txt`)
  - PostgreSQL driver (psycopg2-binary)
  - SQLAlchemy ORM
  - Production logging

---

## ✅ Phase 2: COMPLETE - Kubernetes Configuration (Helm Chart)

### Helm Chart Structure
```
k8s/helm/ai-compliance/
├── Chart.yaml                          ✅ Created
├── values.yaml                         ✅ Created
└── templates/
    ├── _helpers.tpl                    ✅ Created
    ├── namespace.yaml                  ✅ Created
    ├── configmap.yaml                  ✅ Created
    ├── secrets.yaml                    ✅ Created
    ├── database-statefulset.yaml       ✅ Created
    ├── database-service.yaml           ✅ Created
    ├── backend-deployment.yaml         ✅ Created
    ├── backend-service.yaml            ✅ Created
    ├── frontend-deployment.yaml        ✅ Created
    ├── frontend-service.yaml           ✅ Created
    ├── ingress.yaml                    ✅ Created
    └── hpa.yaml                        ✅ Created
```

### Configuration Details
- **Namespace**: `ai-compliance`
- **Frontend**: 2 replicas, auto-scaling 2-10
- **Backend**: 3 replicas, auto-scaling 3-20
- **Database**: PostgreSQL (TimescaleDB), 20Gi storage
- **Ingress**: compliance.opssightai.com
- **SSL**: Shared certificate with OpsSightAI

---

## ✅ Phase 3: COMPLETE - SSL Certificate Updated

- ✅ Updated `opssightai/k8s/ssl-certificate.yaml`
- ✅ Added `compliance.opssightai.com` to domains
- ✅ Will use existing static IP: 34.117.179.95

---

## 🔄 Phase 4: PENDING - Build and Push Docker Images

### Required Actions

#### 1. Build Backend Image
```bash
cd ai-compliance-platform/backend
docker build --platform linux/amd64 -f Dockerfile.prod \
  -t gcr.io/alpfr-splunk-integration/ai-compliance-backend:latest .
docker push gcr.io/alpfr-splunk-integration/ai-compliance-backend:latest
```

#### 2. Build Frontend Image
```bash
cd ai-compliance-platform/frontend
docker build --platform linux/amd64 -f Dockerfile.prod \
  -t gcr.io/alpfr-splunk-integration/ai-compliance-frontend:latest .
docker push gcr.io/alpfr-splunk-integration/ai-compliance-frontend:latest
```

---

## 🔄 Phase 5: PENDING - Deploy to GKE

### Required Actions

#### 1. Update SSL Certificate
```bash
kubectl apply -f opssightai/k8s/ssl-certificate.yaml
```

#### 2. Deploy AI Compliance Platform
```bash
cd ai-compliance-platform

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Deploy with Helm
helm install ai-compliance ./k8s/helm/ai-compliance \
  --namespace ai-compliance \
  --create-namespace \
  --set frontend.image.repository=gcr.io/alpfr-splunk-integration/ai-compliance-frontend \
  --set frontend.image.tag=latest \
  --set backend.image.repository=gcr.io/alpfr-splunk-integration/ai-compliance-backend \
  --set backend.image.tag=latest \
  --set database.secrets.postgresPassword=$DB_PASSWORD \
  --set backend.secrets.databasePassword=$DB_PASSWORD \
  --set backend.secrets.jwtSecret=$JWT_SECRET \
  --wait --timeout=10m
```

#### 3. Initialize Database
```bash
# Port forward to database
kubectl port-forward -n ai-compliance statefulset/ai-compliance-database 5432:5432 &

# Run initialization script
PGPASSWORD=$DB_PASSWORD psql -h localhost -U postgres -d ai_compliance \
  -f database/init-db.sql

# Stop port forward
kill %1
```

---

## 🔄 Phase 6: PENDING - DNS Configuration

### Required Actions

Add DNS A record for compliance subdomain:

```
Type: A
Name: compliance
Value: 34.117.179.95
TTL: 3600
```

**Note**: This uses the same static IP as opssightai.com

---

## 📊 Deployment Architecture

```
Internet
    ↓
Google Cloud Load Balancer (34.117.179.95)
    ↓
    ├─→ opssightai.com → OpsSightAI (namespace: opssightai)
    │
    └─→ compliance.opssightai.com → AI Compliance (namespace: ai-compliance)
            ↓
        Ingress
            ↓
            ├─→ Frontend Service → Frontend Pods (2 replicas)
            │                         ↓
            │                      Nginx + React
            │
            └─→ Backend Service → Backend Pods (3 replicas)
                                     ↓
                                FastAPI + Uvicorn
                                     ↓
                                PostgreSQL Service
                                     ↓
                                PostgreSQL StatefulSet
```

---

## 📊 Resource Allocation

### Current Cluster Status
- **Cluster**: sermon-slicer-cluster
- **Nodes**: 2× n1-standard-2 (4 vCPU, 15GB RAM total)
- **Current Usage**: OpsSightAI (6 pods)
- **Adding**: AI Compliance (6 pods)
- **Total**: 12 pods

### AI Compliance Resources
| Component | Replicas | CPU Request | Memory Request | Storage |
|-----------|----------|-------------|----------------|---------|
| Frontend  | 2        | 200m        | 256Mi          | -       |
| Backend   | 3        | 600m        | 768Mi          | -       |
| PostgreSQL| 1        | 500m        | 1Gi            | 20Gi    |
| **Total** | **6**    | **1.3 cores** | **~2Gi**     | **20Gi** |

### Combined Cluster Usage
- **OpsSightAI**: ~1.5 cores, ~2.5Gi RAM
- **AI Compliance**: ~1.3 cores, ~2Gi RAM
- **Total**: ~2.8 cores, ~4.5Gi RAM
- **Available**: 4 vCPU, 15GB RAM
- **Status**: ✅ Fits comfortably in existing cluster

---

## 🎯 URLs After Deployment

- **OpsSightAI**: https://opssightai.com
- **AI Compliance**: https://compliance.opssightai.com
- **Shared SSL**: Single certificate for all domains

---

## ⏱️ Estimated Timeline

| Phase | Status | Duration |
|-------|--------|----------|
| Phase 1: Configurations | ✅ Complete | - |
| Phase 2: Helm Chart | ✅ Complete | - |
| Phase 3: SSL Update | ✅ Complete | - |
| Phase 4: Build Images | 🔄 Pending | 15-20 min |
| Phase 5: Deploy to GKE | 🔄 Pending | 10-15 min |
| Phase 6: DNS Config | 🔄 Pending | 1-2 hours |
| **Total Remaining** | | **~2-3 hours** |

---

## 🚀 Next Steps

### Immediate Actions Required

1. **Build Docker Images** (15-20 minutes)
   - Build backend image for linux/amd64
   - Build frontend image for linux/amd64
   - Push both images to GCR

2. **Deploy to GKE** (10-15 minutes)
   - Update SSL certificate
   - Deploy with Helm
   - Initialize database
   - Verify pods running

3. **Configure DNS** (1-2 hours for propagation)
   - Add compliance.opssightai.com A record
   - Wait for DNS propagation
   - Verify SSL certificate updates

### Verification Steps

After deployment:
```bash
# Check pods
kubectl get pods -n ai-compliance

# Check services
kubectl get svc -n ai-compliance

# Check ingress
kubectl get ingress -n ai-compliance

# Test health endpoints
curl http://34.57.180.112/api/health  # OpsSightAI
curl https://compliance.opssightai.com/api/health  # AI Compliance (after DNS)
```

---

## 📝 Important Notes

### Database Migration
- ✅ SQLite → PostgreSQL migration complete
- ✅ Schema includes all tables from local version
- ✅ Default users and AI models pre-loaded
- ⚠️ Existing local data will NOT be migrated (fresh start)

### Authentication
- **Default Admin**: admin / admin123
- **Default Inspector**: inspector / inspector123
- ⚠️ Change passwords after first login!

### Features Ready
- ✅ LLM Management (7 AI models)
- ✅ Executive Dashboard
- ✅ Guardrail System
- ✅ Audit Trail
- ✅ Multi-industry support

---

## 💰 Cost Impact

- **Additional Cost**: $0 (fits in existing cluster)
- **Current Cluster**: ~$218/month (unchanged)
- **Benefit**: Two production applications on one cluster

---

## 🆘 Troubleshooting

### If Pods Don't Start
```bash
# Check pod status
kubectl describe pod <pod-name> -n ai-compliance

# Check logs
kubectl logs <pod-name> -n ai-compliance

# Common issues:
# - Image pull errors: Verify GCR permissions
# - Database connection: Check secrets and service
# - Init container failing: Database not ready yet
```

### If Ingress Doesn't Work
```bash
# Check ingress status
kubectl describe ingress -n ai-compliance

# Verify SSL certificate
kubectl get managedcertificate opssightai-ssl-cert -n opssightai

# Check DNS
nslookup compliance.opssightai.com 8.8.8.8
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [x] Production Dockerfiles created
- [x] Nginx configuration created
- [x] Database schema created
- [x] Helm chart complete
- [x] SSL certificate updated
- [ ] Docker images built
- [ ] Images pushed to GCR

### Deployment
- [ ] SSL certificate applied
- [ ] Helm chart deployed
- [ ] Database initialized
- [ ] All pods running
- [ ] Services accessible

### Post-Deployment
- [ ] DNS configured
- [ ] SSL certificate active for compliance subdomain
- [ ] Application accessible at https://compliance.opssightai.com
- [ ] All features tested
- [ ] Default passwords changed

---

**Status**: 🟡 **READY FOR PHASE 4** - Build and push Docker images

**Next Command**: Build backend Docker image
