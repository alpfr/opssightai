# JHB StreamPulse - GKE Deployment Guide

Complete guide for deploying JHB StreamPulse to Google Kubernetes Engine.

## 📋 Prerequisites

- Google Cloud SDK installed and configured
- kubectl installed
- Access to GCP project: `alpfr-splunk-integration`
- Access to GKE cluster: `sermon-slicer-cluster` in `us-central1`

## 🚀 Quick Deployment

```bash
# From the jhb-streampulse directory
./deploy-to-gke.sh
```

This script will:
1. Set the GCP project
2. Get cluster credentials
3. Build Docker image using Cloud Build
4. Deploy all Kubernetes resources
5. Wait for deployment to be ready

## 📦 What Gets Deployed

### Kubernetes Resources

1. **Namespace**: `jhb-streampulse`
2. **ConfigMap**: Application configuration (NODE_ENV, PORT)
3. **Secret**: Admin PIN (default: 1234)
4. **PersistentVolumeClaim**: 5Gi storage for SQLite database
5. **Deployment**: 2 replicas with rolling updates
6. **Service**: ClusterIP service on port 80
7. **HPA**: Auto-scaling (2-5 replicas based on CPU/memory)
8. **ManagedCertificate**: SSL certificate for domains
9. **Ingress**: GCE ingress with HTTPS

### Application Configuration

- **Image**: `gcr.io/alpfr-splunk-integration/jhb-streampulse:v2.0.0`
- **Replicas**: 2-5 (auto-scaling)
- **Resources**:
  - Requests: 256Mi memory, 250m CPU
  - Limits: 512Mi memory, 500m CPU
- **Storage**: 5Gi persistent volume for SQLite database
- **Health Checks**: Liveness and readiness probes on `/api/stats`

## 🔧 Manual Deployment Steps

If you prefer to deploy manually:

### Step 1: Set GCP Project

```bash
gcloud config set project alpfr-splunk-integration
```

### Step 2: Get Cluster Credentials

```bash
gcloud container clusters get-credentials sermon-slicer-cluster --region=us-central1
```

### Step 3: Build Docker Image

```bash
# Build using Cloud Build (recommended for correct architecture)
gcloud builds submit --tag gcr.io/alpfr-splunk-integration/jhb-streampulse:v2.0.0 .
gcloud builds submit --tag gcr.io/alpfr-splunk-integration/jhb-streampulse:latest .
```

### Step 4: Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/managed-certificate.yaml
kubectl apply -f k8s/ingress.yaml
```

### Step 5: Wait for Deployment

```bash
kubectl rollout status deployment/jhb-streampulse -n jhb-streampulse
```

## 🔐 Security Configuration

### Change Admin PIN

Before deploying to production, update the admin PIN:

```bash
# Edit the secret
kubectl edit secret jhb-streampulse-secrets -n jhb-streampulse

# Or update the file and reapply
# Edit k8s/secret.yaml, then:
kubectl apply -f k8s/secret.yaml
```

## 🌐 DNS Configuration

### Get External IP

```bash
kubectl get ingress jhb-streampulse-ingress -n jhb-streampulse
```

### Update DNS Records

Once you have the external IP, create DNS A records:

```
streampulse.jesushouse.com      A    <EXTERNAL_IP>
www.streampulse.jesushouse.com  A    <EXTERNAL_IP>
```

### SSL Certificate

The Google-managed certificate will automatically provision once DNS is configured. Check status:

```bash
kubectl describe managedcertificate jhb-streampulse-cert -n jhb-streampulse
```

It takes 15-60 minutes after DNS propagation for the certificate to become active.

## 📊 Monitoring & Management

### Check Pod Status

```bash
kubectl get pods -n jhb-streampulse
```

### View Logs

```bash
# All pods
kubectl logs -f deployment/jhb-streampulse -n jhb-streampulse

# Specific pod
kubectl logs -f <pod-name> -n jhb-streampulse
```

### Check Service

```bash
kubectl get service -n jhb-streampulse
kubectl describe service jhb-streampulse -n jhb-streampulse
```

### Check Ingress

```bash
kubectl get ingress -n jhb-streampulse
kubectl describe ingress jhb-streampulse-ingress -n jhb-streampulse
```

### Check Auto-scaling

```bash
kubectl get hpa -n jhb-streampulse
kubectl describe hpa jhb-streampulse-hpa -n jhb-streampulse
```

### Check Storage

```bash
kubectl get pvc -n jhb-streampulse
kubectl describe pvc jhb-streampulse-data -n jhb-streampulse
```

## 🔄 Updates & Rollbacks

### Deploy New Version

```bash
# Build new image
gcloud builds submit --tag gcr.io/alpfr-splunk-integration/jhb-streampulse:v2.1.0 .

# Update deployment
kubectl set image deployment/jhb-streampulse \
  jhb-streampulse=gcr.io/alpfr-splunk-integration/jhb-streampulse:v2.1.0 \
  -n jhb-streampulse

# Watch rollout
kubectl rollout status deployment/jhb-streampulse -n jhb-streampulse
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/jhb-streampulse -n jhb-streampulse

# Rollback to specific revision
kubectl rollout undo deployment/jhb-streampulse -n jhb-streampulse --to-revision=2
```

### View Rollout History

```bash
kubectl rollout history deployment/jhb-streampulse -n jhb-streampulse
```

## 💾 Database Backup

The SQLite database is stored in a persistent volume. To backup:

### Method 1: Export via API

```bash
# Download CSV export
curl -O http://streampulse.jesushouse.com/api/export
```

### Method 2: Copy from Pod

```bash
# Get pod name
POD=$(kubectl get pod -n jhb-streampulse -l app=jhb-streampulse -o jsonpath='{.items[0].metadata.name}')

# Copy database file
kubectl cp jhb-streampulse/$POD:/app/data/streampulse.db ./backup-$(date +%Y%m%d).db
```

### Restore Database

```bash
# Copy backup to pod
kubectl cp ./backup.db jhb-streampulse/$POD:/app/data/streampulse.db

# Restart deployment to pick up changes
kubectl rollout restart deployment/jhb-streampulse -n jhb-streampulse
```

## 🧪 Testing

### Port Forward for Local Testing

```bash
kubectl port-forward -n jhb-streampulse service/jhb-streampulse 8080:80

# Access at: http://localhost:8080
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:8080/api/stats

# Get data
curl http://localhost:8080/api/data

# Export CSV
curl -O http://localhost:8080/api/export
```

## 🆘 Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n jhb-streampulse

# Describe pod
kubectl describe pod <pod-name> -n jhb-streampulse

# Check logs
kubectl logs <pod-name> -n jhb-streampulse
```

### Ingress Not Getting IP

```bash
# Check ingress status
kubectl describe ingress jhb-streampulse-ingress -n jhb-streampulse

# Check ingress controller logs
kubectl logs -n kube-system -l k8s-app=glbc --tail=100
```

### Certificate Not Provisioning

```bash
# Check certificate status
kubectl describe managedcertificate jhb-streampulse-cert -n jhb-streampulse

# Common issues:
# - DNS not pointing to ingress IP
# - DNS not propagated yet (wait 5-60 minutes)
# - Domain ownership not verified
```

### Database Issues

```bash
# Check PVC status
kubectl get pvc -n jhb-streampulse
kubectl describe pvc jhb-streampulse-data -n jhb-streampulse

# Check if volume is mounted
kubectl exec -it <pod-name> -n jhb-streampulse -- ls -la /app/data
```

### High Memory/CPU Usage

```bash
# Check resource usage
kubectl top pods -n jhb-streampulse

# HPA will automatically scale if needed
kubectl get hpa -n jhb-streampulse
```

## 🔧 Configuration Changes

### Update Environment Variables

```bash
# Edit configmap
kubectl edit configmap jhb-streampulse-config -n jhb-streampulse

# Restart deployment to pick up changes
kubectl rollout restart deployment/jhb-streampulse -n jhb-streampulse
```

### Scale Manually

```bash
# Scale to specific number of replicas
kubectl scale deployment jhb-streampulse --replicas=3 -n jhb-streampulse

# Note: HPA will override this if enabled
```

### Disable Auto-scaling

```bash
# Delete HPA
kubectl delete hpa jhb-streampulse-hpa -n jhb-streampulse

# Then scale manually
kubectl scale deployment jhb-streampulse --replicas=2 -n jhb-streampulse
```

## 📈 Performance Tuning

### Adjust Resource Limits

Edit `k8s/deployment.yaml`:

```yaml
resources:
  requests:
    memory: "512Mi"  # Increase if needed
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

Then apply:

```bash
kubectl apply -f k8s/deployment.yaml
```

### Adjust Auto-scaling

Edit `k8s/hpa.yaml` to change min/max replicas or thresholds, then:

```bash
kubectl apply -f k8s/hpa.yaml
```

## 🗑️ Cleanup

### Delete Deployment

```bash
# Delete all resources
kubectl delete namespace jhb-streampulse

# Or delete individually
kubectl delete -f k8s/
```

### Delete Docker Images

```bash
# List images
gcloud container images list --repository=gcr.io/alpfr-splunk-integration

# Delete specific version
gcloud container images delete gcr.io/alpfr-splunk-integration/jhb-streampulse:v2.0.0
```

## 📞 Support

For issues or questions:
- Check logs: `kubectl logs -f deployment/jhb-streampulse -n jhb-streampulse`
- Check events: `kubectl get events -n jhb-streampulse --sort-by='.lastTimestamp'`
- Describe resources: `kubectl describe <resource-type> <resource-name> -n jhb-streampulse`

---

**Deployment Date**: February 13, 2026  
**Version**: v2.0.0  
**Platform**: Google Kubernetes Engine  
**Cluster**: sermon-slicer-cluster (us-central1)
