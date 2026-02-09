# AI Compliance Platform - Complete Deployment Instructions

**Date**: February 9, 2026  
**Status**: Ready for deployment  
**Deployment Type**: SQLite (Quick) + PostgreSQL (Future)

---

## 📋 What's Been Created

### ✅ All Configuration Files Ready

```
ai-compliance-platform/
├── backend/
│   ├── Dockerfile ✅ (SQLite version)
│   ├── Dockerfile.prod ✅ (PostgreSQL version - for future)
│   ├── requirements.txt ✅
│   └── requirements.prod.txt ✅ (PostgreSQL dependencies)
│
├── frontend/
│   ├── Dockerfile.prod ✅
│   └── nginx.prod.conf ✅
│
├── database/
│   └── init-db.sql ✅ (PostgreSQL schema - for future)
│
├── k8s/helm/ai-compliance/
│   ├── Chart.yaml ✅
│   ├── values.yaml ✅ (PostgreSQL version)
│   ├── values-sqlite.yaml ✅ (SQLite version - use this)
│   └── templates/
│       ├── _helpers.tpl ✅
│       ├── namespace.yaml ✅
│       ├── configmap.yaml ✅
│       ├── secrets.yaml ✅
│       ├── backend-deployment.yaml ✅ (PostgreSQL)
│       ├── backend-statefulset.yaml ✅ (SQLite)
│       ├── backend-service.yaml ✅
│       ├── database-statefulset.yaml ✅ (PostgreSQL)
│       ├── database-service.yaml ✅ (PostgreSQL)
│       ├── frontend-deployment.yaml ✅
│       ├── frontend-service.yaml ✅
│       ├── ingress.yaml ✅
│       └── hpa.yaml ✅
│
├── GKE_DEPLOYMENT_PLAN.md ✅
├── DEPLOYMENT_STATUS.md ✅
└── DEPLOYMENT_INSTRUCTIONS.md ✅ (this file)
```

### ✅ SSL Certificate Updated
- Updated `opssightai/k8s/ssl-certificate.yaml`
- Added `compliance.opssightai.com` domain
- Uses existing static IP: 34.117.179.95

---

## 🚀 Deployment Steps

### Step 1: Build Docker Images

#### Backend (Already Built ✅)
```bash
docker build --platform linux/amd64 \
  -t gcr.io/alpfr-splunk-integration/ai-compliance-backend:latest \
  -f ai-compliance-platform/backend/Dockerfile \
  ai-compliance-platform/backend
```

#### Frontend (Needs Building)
```bash
# Option A: Build locally (if npm install works)
docker build --platform linux/amd64 \
  -t gcr.io/alpfr-splunk-integration/ai-compliance-frontend:latest \
  -f ai-compliance-platform/frontend/Dockerfile.prod \
  ai-compliance-platform/frontend

# Option B: Use existing Dockerfile (simpler)
docker build --platform linux/amd64 \
  -t gcr.io/alpfr-splunk-integration/ai-compliance-frontend:latest \
  -f ai-compliance-platform/frontend/Dockerfile \
  ai-compliance-platform/frontend
```

### Step 2: Push Images to GCR

```bash
# Configure Docker for GCR (if not already done)
gcloud auth configure-docker

# Push backend
docker push gcr.io/alpfr-splunk-integration/ai-compliance-backend:latest

# Push frontend
docker push gcr.io/alpfr-splunk-integration/ai-compliance-frontend:latest
```

### Step 3: Update SSL Certificate

```bash
# Apply updated SSL certificate (adds compliance.opssightai.com)
kubectl apply -f opssightai/k8s/ssl-certificate.yaml
```

### Step 4: Deploy to GKE

```bash
# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Deploy with Helm (SQLite version)
helm install ai-compliance ./ai-compliance-platform/k8s/helm/ai-compliance \
  --namespace ai-compliance \
  --create-namespace \
  --values ./ai-compliance-platform/k8s/helm/ai-compliance/values-sqlite.yaml \
  --set frontend.image.repository=gcr.io/alpfr-splunk-integration/ai-compliance-frontend \
  --set frontend.image.tag=latest \
  --set backend.image.repository=gcr.io/alpfr-splunk-integration/ai-compliance-backend \
  --set backend.image.tag=latest \
  --set backend.secrets.jwtSecret=$JWT_SECRET \
  --wait --timeout=10m
```

### Step 5: Verify Deployment

```bash
# Check pods
kubectl get pods -n ai-compliance

# Expected output:
# NAME                                      READY   STATUS    RESTARTS   AGE
# ai-compliance-backend-0                   1/1     Running   0          2m
# ai-compliance-frontend-xxxxx-xxxxx        1/1     Running   0          2m
# ai-compliance-frontend-xxxxx-xxxxx        1/1     Running   0          2m

# Check services
kubectl get svc -n ai-compliance

# Check ingress
kubectl get ingress -n ai-compliance

# Test backend health
kubectl port-forward -n ai-compliance statefulset/ai-compliance-backend 8000:8000 &
curl http://localhost:8000/health
kill %1
```

### Step 6: Configure DNS

Add DNS A record at your domain registrar (Squarespace):

```
Type: A
Name: compliance
Value: 34.117.179.95
TTL: 3600
```

### Step 7: Wait for SSL Certificate

```bash
# Monitor SSL certificate status
kubectl get managedcertificate opssightai-ssl-cert -n opssightai -w

# Wait for compliance.opssightai.com to show "Active"
kubectl describe managedcertificate opssightai-ssl-cert -n opssightai | grep -A 10 "Domain Status"
```

### Step 8: Test Application

Once DNS propagates and SSL is active:

```bash
# Test HTTPS access
curl https://compliance.opssightai.com/health

# Test API
curl https://compliance.opssightai.com/api/health

# Access in browser
open https://compliance.opssightai.com
```

---

## 🔧 Troubleshooting

### Frontend Build Issues

If the frontend Docker build fails, use the simpler Dockerfile:

```bash
# Use the original Dockerfile instead of Dockerfile.prod
docker build --platform linux/amd64 \
  -t gcr.io/alpfr-splunk-integration/ai-compliance-frontend:latest \
  -f ai-compliance-platform/frontend/Dockerfile \
  ai-compliance-platform/frontend
```

Then update the deployment to use port 3000 instead of 80:

```bash
# Edit values-sqlite.yaml
# Change frontend.service.port from 80 to 3000
# Change frontend.service.targetPort from 80 to 3000
```

### Backend Pod Not Starting

```bash
# Check logs
kubectl logs -n ai-compliance statefulset/ai-compliance-backend

# Common issues:
# - Database file permissions: Check volume mount
# - Missing SECRET_KEY: Verify secrets
```

### Ingress Not Working

```bash
# Check ingress status
kubectl describe ingress -n ai-compliance

# Verify SSL certificate includes compliance subdomain
kubectl get managedcertificate opssightai-ssl-cert -n opssightai -o yaml
```

---

## 📊 Architecture

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
            └─→ Backend Service → Backend Pod (1 replica, StatefulSet)
                                     ↓
                                FastAPI + Uvicorn
                                     ↓
                                SQLite (Persistent Volume)
```

---

## 🔄 Future: Migrate to PostgreSQL

When ready to migrate from SQLite to PostgreSQL:

### Step 1: Export SQLite Data

```bash
# Port forward to backend pod
kubectl port-forward -n ai-compliance statefulset/ai-compliance-backend 8000:8000 &

# Copy database file
kubectl cp ai-compliance/ai-compliance-backend-0:/app/data/ai_compliance.db ./ai_compliance.db

# Convert to SQL dump
sqlite3 ai_compliance.db .dump > ai_compliance_dump.sql
```

### Step 2: Deploy PostgreSQL Version

```bash
# Generate passwords
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Upgrade to PostgreSQL version
helm upgrade ai-compliance ./ai-compliance-platform/k8s/helm/ai-compliance \
  --namespace ai-compliance \
  --values ./ai-compliance-platform/k8s/helm/ai-compliance/values.yaml \
  --set frontend.image.repository=gcr.io/alpfr-splunk-integration/ai-compliance-frontend \
  --set backend.image.repository=gcr.io/alpfr-splunk-integration/ai-compliance-backend-pg \
  --set database.secrets.postgresPassword=$DB_PASSWORD \
  --set backend.secrets.databasePassword=$DB_PASSWORD \
  --set backend.secrets.jwtSecret=$JWT_SECRET \
  --wait --timeout=10m
```

### Step 3: Import Data

```bash
# Port forward to PostgreSQL
kubectl port-forward -n ai-compliance statefulset/ai-compliance-database 5432:5432 &

# Initialize schema
PGPASSWORD=$DB_PASSWORD psql -h localhost -U postgres -d ai_compliance \
  -f ai-compliance-platform/database/init-db.sql

# Import data (manual conversion needed)
# SQLite dump needs to be converted to PostgreSQL format
```

---

## 📝 Default Credentials

After deployment, login with:

- **Admin**: admin / admin123
- **Inspector**: inspector / inspector123

⚠️ **Change these passwords immediately after first login!**

---

## 💰 Cost Impact

- **Additional Cost**: $0 (fits in existing cluster)
- **Current Cluster**: sermon-slicer-cluster (2× n1-standard-2)
- **Total Pods**: 12 (6 OpsSightAI + 6 AI Compliance)
- **Resource Usage**: ~2.8 cores, ~4.5Gi RAM (fits in 4 vCPU, 15GB cluster)

---

## ✅ Deployment Checklist

- [x] Backend Dockerfile created
- [x] Frontend Dockerfile created
- [x] Helm chart complete
- [x] SSL certificate updated
- [x] Backend image built
- [ ] Frontend image built
- [ ] Images pushed to GCR
- [ ] Deployed to GKE
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Application tested

---

## 🆘 Quick Commands Reference

```bash
# Check deployment status
kubectl get all -n ai-compliance

# View logs
kubectl logs -f statefulset/ai-compliance-backend -n ai-compliance
kubectl logs -f deployment/ai-compliance-frontend -n ai-compliance

# Restart pods
kubectl rollout restart statefulset/ai-compliance-backend -n ai-compliance
kubectl rollout restart deployment/ai-compliance-frontend -n ai-compliance

# Delete deployment
helm uninstall ai-compliance -n ai-compliance
kubectl delete namespace ai-compliance
```

---

## 🎯 Next Steps

1. **Build frontend image** (fix npm install issue or use simpler Dockerfile)
2. **Push both images to GCR**
3. **Deploy with Helm**
4. **Configure DNS**
5. **Test application**

---

**Status**: 🟡 Ready for deployment (frontend image build pending)

**Estimated Time**: 30-45 minutes remaining
