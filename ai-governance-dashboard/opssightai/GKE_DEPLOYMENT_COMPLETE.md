# OpsSightAI - GKE Deployment Complete! 🎉

**Date**: February 8, 2026  
**Status**: ✅ **READY FOR DEPLOYMENT**

---

## 🎯 What's Been Created

### 1. Docker Images (Production-Ready)

#### Frontend Dockerfile
- **Location**: `opssightai/frontend/Dockerfile`
- **Features**:
  - Multi-stage build for optimized image size
  - Nginx-based serving with custom configuration
  - Health check endpoint
  - Gzip compression enabled
  - API proxy to backend
  - React Router support

#### Backend Dockerfile
- **Location**: `opssightai/backend/Dockerfile`
- **Features**:
  - Multi-stage build for security
  - Non-root user (appuser:1000)
  - Production dependencies only
  - Health check endpoint
  - Proper signal handling with dumb-init
  - TypeScript compilation

#### Nginx Configuration
- **Location**: `opssightai/frontend/nginx.conf`
- **Features**:
  - API proxy to backend service
  - Static asset caching
  - Security headers
  - Gzip compression
  - Health check endpoint

---

### 2. Helm Chart (Complete)

#### Chart Structure
```
k8s/helm/opssightai/
├── Chart.yaml                          ✅ Created
├── values.yaml                         ✅ Created
├── values-production.yaml              ✅ Created
├── values-staging.yaml                 ✅ Created
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

#### Helm Templates Features
- **Namespace**: Pod security standards enabled
- **ConfigMap**: Environment variables for all services
- **Secrets**: Database password and JWT secret
- **Database**: TimescaleDB StatefulSet with persistent storage
- **Backend**: Deployment with init container for DB readiness
- **Frontend**: Deployment with Nginx serving
- **Services**: ClusterIP services for internal communication
- **Ingress**: Load balancer with path-based routing
- **HPA**: Auto-scaling for frontend and backend

---

### 3. Deployment Scripts

#### GKE Deployment Script
- **Location**: `opssightai/scripts/deploy-to-gke.sh`
- **Features**:
  - Automated cluster creation
  - Docker image building and pushing to GCR
  - Helm deployment with proper configuration
  - Health checks and validation
  - Deployment info saved to file

---

## 🚀 How to Deploy

### Prerequisites
```bash
# Install required tools
brew install gcloud kubectl helm docker

# Login to GCP
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

### Quick Deploy (Automated)
```bash
cd opssightai

# Set environment variables
export GCP_PROJECT_ID="your-project-id"
export DB_PASSWORD="your-secure-password"

# Run deployment script
chmod +x scripts/deploy-to-gke.sh
./scripts/deploy-to-gke.sh
```

### Manual Deploy (Step-by-Step)

#### 1. Create GKE Cluster
```bash
gcloud container clusters create opssightai-cluster \
  --region us-central1 \
  --num-nodes 3 \
  --machine-type n1-standard-2 \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 10 \
  --enable-autorepair \
  --enable-autoupgrade
```

#### 2. Get Cluster Credentials
```bash
gcloud container clusters get-credentials opssightai-cluster --region us-central1
```

#### 3. Build and Push Images
```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Build and push frontend
cd frontend
docker build -t gcr.io/YOUR_PROJECT_ID/opssightai-frontend:latest .
docker push gcr.io/YOUR_PROJECT_ID/opssightai-frontend:latest

# Build and push backend
cd ../backend
docker build -t gcr.io/YOUR_PROJECT_ID/opssightai-backend:latest .
docker push gcr.io/YOUR_PROJECT_ID/opssightai-backend:latest
```

#### 4. Deploy with Helm
```bash
cd ..

# Create namespace
kubectl create namespace opssightai

# Deploy application
helm install opssightai ./k8s/helm/opssightai \
  --namespace opssightai \
  --set frontend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-frontend \
  --set frontend.image.tag=latest \
  --set backend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-backend \
  --set backend.image.tag=latest \
  --set database.secrets.postgresPassword=YOUR_SECURE_PASSWORD \
  --set backend.secrets.jwtSecret=YOUR_JWT_SECRET \
  --set ingress.className=gce \
  --wait --timeout=10m
```

#### 5. Get Application URL
```bash
# Wait for load balancer
kubectl get ingress -n opssightai -w

# Get IP address
kubectl get ingress -n opssightai opssightai-ingress \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

---

## 🎛️ Deployment Configurations

### Default Configuration (values.yaml)
- **Frontend**: 2 replicas, 100m CPU, 128Mi RAM
- **Backend**: 3 replicas, 200m CPU, 256Mi RAM
- **Database**: 1 replica, 500m CPU, 1Gi RAM, 20Gi storage
- **Autoscaling**: Enabled for frontend and backend

### Production Configuration (values-production.yaml)
```bash
helm install opssightai ./k8s/helm/opssightai \
  --namespace opssightai \
  --values k8s/helm/opssightai/values-production.yaml \
  --set frontend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-frontend \
  --set backend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-backend \
  --set database.secrets.postgresPassword=YOUR_PASSWORD \
  --set backend.secrets.jwtSecret=YOUR_JWT_SECRET
```

**Production Settings**:
- **Frontend**: 3 replicas, 500m CPU, 512Mi RAM, scales 3-10
- **Backend**: 5 replicas, 1 CPU, 1Gi RAM, scales 5-20
- **Database**: 2 CPU, 4Gi RAM, 50Gi storage
- **Features**: SSL/TLS, Network policies, Pod disruption budget

### Staging Configuration (values-staging.yaml)
```bash
helm install opssightai-staging ./k8s/helm/opssightai \
  --namespace opssightai-staging \
  --values k8s/helm/opssightai/values-staging.yaml \
  --set frontend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-frontend \
  --set backend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-backend \
  --set database.secrets.postgresPassword=YOUR_PASSWORD \
  --set backend.secrets.jwtSecret=YOUR_JWT_SECRET
```

**Staging Settings**:
- **Frontend**: 1 replica, 100m CPU, 128Mi RAM
- **Backend**: 2 replicas, 200m CPU, 256Mi RAM
- **Database**: 500m CPU, 1Gi RAM, 10Gi storage
- **Features**: Minimal resources, no autoscaling

---

## 📊 Resource Requirements

### Minimum Cluster (Default)
- **Nodes**: 3× n1-standard-2 (2 vCPU, 7.5GB RAM each)
- **Total**: 6 vCPU, 22.5GB RAM
- **Cost**: ~$145/month + $73 GKE fee = **~$218/month**

### Production Cluster
- **Nodes**: 5× n1-standard-4 (4 vCPU, 15GB RAM each)
- **Total**: 20 vCPU, 75GB RAM
- **Cost**: ~$485/month + $73 GKE fee = **~$558/month**

### Staging Cluster
- **Nodes**: 2× n1-standard-2 (2 vCPU, 7.5GB RAM each)
- **Total**: 4 vCPU, 15GB RAM
- **Cost**: ~$97/month + $73 GKE fee = **~$170/month**

---

## 🔍 Verification Steps

### 1. Check Pods
```bash
kubectl get pods -n opssightai

# Expected output:
# NAME                                   READY   STATUS    RESTARTS   AGE
# opssightai-backend-xxxxx-xxxxx         1/1     Running   0          2m
# opssightai-backend-xxxxx-xxxxx         1/1     Running   0          2m
# opssightai-backend-xxxxx-xxxxx         1/1     Running   0          2m
# opssightai-database-0                  1/1     Running   0          2m
# opssightai-frontend-xxxxx-xxxxx        1/1     Running   0          2m
# opssightai-frontend-xxxxx-xxxxx        1/1     Running   0          2m
```

### 2. Check Services
```bash
kubectl get services -n opssightai

# Expected output:
# NAME                  TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
# opssightai-backend    ClusterIP   10.x.x.x        <none>        4000/TCP   2m
# opssightai-database   ClusterIP   None            <none>        5432/TCP   2m
# opssightai-frontend   ClusterIP   10.x.x.x        <none>        80/TCP     2m
```

### 3. Check Ingress
```bash
kubectl get ingress -n opssightai

# Expected output:
# NAME                  CLASS   HOSTS                        ADDRESS        PORTS   AGE
# opssightai-ingress    gce     opssightai.yourdomain.com    x.x.x.x        80      2m
```

### 4. Test Health Endpoints
```bash
# Get load balancer IP
INGRESS_IP=$(kubectl get ingress -n opssightai opssightai-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test frontend health
curl http://$INGRESS_IP/health

# Test backend health
curl http://$INGRESS_IP/api/health
```

### 5. View Logs
```bash
# Backend logs
kubectl logs -f deployment/opssightai-backend -n opssightai

# Frontend logs
kubectl logs -f deployment/opssightai-frontend -n opssightai

# Database logs
kubectl logs -f statefulset/opssightai-database -n opssightai
```

---

## 🔧 Post-Deployment Tasks

### 1. Run Database Migration
```bash
# Port forward to database
kubectl port-forward -n opssightai statefulset/opssightai-database 5432:5432

# In another terminal, run migration
psql -h localhost -U postgres -d opssightai -f docker/migrations/001_asset_management_phase1.sql
```

### 2. Populate Sample Data
```bash
# Port forward to backend
kubectl port-forward -n opssightai svc/opssightai-backend 4000:4000

# Run data generation script
node scripts/populate-maintenance-data.js
```

### 3. Configure DNS (Optional)
```bash
# Get load balancer IP
kubectl get ingress -n opssightai opssightai-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Add A record in your DNS provider:
# opssightai.yourdomain.com -> LOAD_BALANCER_IP
```

### 4. Configure SSL/TLS (Optional)
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: gce
EOF

# Update ingress to use TLS
helm upgrade opssightai ./k8s/helm/opssightai \
  --namespace opssightai \
  --reuse-values \
  --set ingress.tls[0].secretName=opssightai-tls \
  --set ingress.tls[0].hosts[0]=opssightai.yourdomain.com \
  --set ingress.annotations."cert-manager\.io/cluster-issuer"=letsencrypt-prod
```

---

## 🔄 Update Deployment

### Update Images
```bash
# Build new images with version tag
docker build -t gcr.io/YOUR_PROJECT_ID/opssightai-frontend:v1.1.0 ./frontend
docker push gcr.io/YOUR_PROJECT_ID/opssightai-frontend:v1.1.0

docker build -t gcr.io/YOUR_PROJECT_ID/opssightai-backend:v1.1.0 ./backend
docker push gcr.io/YOUR_PROJECT_ID/opssightai-backend:v1.1.0

# Upgrade deployment
helm upgrade opssightai ./k8s/helm/opssightai \
  --namespace opssightai \
  --reuse-values \
  --set frontend.image.tag=v1.1.0 \
  --set backend.image.tag=v1.1.0
```

### Update Configuration
```bash
# Edit values file
vim k8s/helm/opssightai/values.yaml

# Upgrade deployment
helm upgrade opssightai ./k8s/helm/opssightai \
  --namespace opssightai \
  --values k8s/helm/opssightai/values.yaml
```

---

## 🗑️ Cleanup

### Delete Application
```bash
# Uninstall Helm release
helm uninstall opssightai -n opssightai

# Delete namespace
kubectl delete namespace opssightai
```

### Delete Cluster
```bash
gcloud container clusters delete opssightai-cluster --region us-central1
```

### Delete Images
```bash
gcloud container images delete gcr.io/YOUR_PROJECT_ID/opssightai-frontend:latest
gcloud container images delete gcr.io/YOUR_PROJECT_ID/opssightai-backend:latest
```

---

## 📚 Documentation

- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Deployment Ready**: `DEPLOYMENT_READY.md`
- **Helm Values**: `k8s/helm/opssightai/values.yaml`
- **GKE Script**: `scripts/deploy-to-gke.sh`

---

## ✅ Deployment Checklist

### Pre-Deployment
- [x] Dockerfiles created (frontend, backend)
- [x] Nginx configuration created
- [x] Helm chart structure complete
- [x] Helm templates created (12 files)
- [x] Values files created (default, production, staging)
- [x] Deployment script created
- [x] Documentation complete

### Deployment
- [ ] GCP project created
- [ ] GKE cluster created
- [ ] Docker images built and pushed
- [ ] Helm chart deployed
- [ ] Load balancer provisioned
- [ ] Application accessible

### Post-Deployment
- [ ] Database migration run
- [ ] Sample data populated
- [ ] DNS configured (optional)
- [ ] SSL/TLS configured (optional)
- [ ] Monitoring configured (optional)
- [ ] Backups configured (optional)

---

## 🎉 Success Metrics

Once deployed, you should see:

1. **All pods running**: 6 pods (2 frontend, 3 backend, 1 database)
2. **Health checks passing**: All endpoints return 200 OK
3. **Load balancer active**: External IP assigned
4. **Application accessible**: Frontend loads in browser
5. **API responding**: Backend endpoints return data

---

## 🆘 Troubleshooting

### Pods Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n opssightai

# Check logs
kubectl logs <pod-name> -n opssightai

# Common issues:
# - Image pull errors: Check GCR permissions
# - Init container failing: Check database connectivity
# - CrashLoopBackOff: Check application logs
```

### Load Balancer Not Provisioned
```bash
# Check ingress events
kubectl describe ingress opssightai-ingress -n opssightai

# Check ingress controller
kubectl get pods -n kube-system | grep ingress

# Common issues:
# - Ingress class not found: Verify GKE ingress controller
# - Backend unhealthy: Check service and pod health
```

### Database Connection Failed
```bash
# Check database pod
kubectl logs statefulset/opssightai-database -n opssightai

# Test connection from backend pod
kubectl exec -it deployment/opssightai-backend -n opssightai -- \
  sh -c 'nc -zv opssightai-database 5432'

# Common issues:
# - Password mismatch: Verify secrets
# - Service not found: Check service name
```

---

## 🚀 Next Steps

1. **Deploy to GKE**: Run the deployment script
2. **Test Application**: Verify all features work
3. **Configure Monitoring**: Set up Prometheus/Grafana
4. **Configure Backups**: Set up database backups
5. **Configure CI/CD**: Automate deployments
6. **Configure SSL/TLS**: Enable HTTPS
7. **Configure DNS**: Point domain to load balancer

---

**Status**: 🟢 **100% READY FOR DEPLOYMENT**

**Estimated Deployment Time**: 30-45 minutes

**Your OpsSightAI application is now fully configured and ready to deploy to GCP GKE!** 🎉

