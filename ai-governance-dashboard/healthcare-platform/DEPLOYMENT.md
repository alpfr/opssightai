# Vantedge Health - Production Deployment Guide

Complete guide for deploying Vantedge Health to Google Kubernetes Engine (GKE).

## 📋 Prerequisites

### Required Tools
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (gcloud CLI)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Docker](https://docs.docker.com/get-docker/)
- Node.js 18+ (for local development)

### GCP Requirements
- Active GCP project with billing enabled
- Appropriate IAM permissions:
  - Kubernetes Engine Admin
  - Service Account User
  - Storage Admin (for Container Registry)
  - Compute Network Admin

### Domain Requirements
- Domain name (e.g., vantedgehealth.com)
- Access to DNS management

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Set your GCP project ID
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export GKE_CLUSTER_NAME="vantedge-health-cluster"

# Authenticate with GCP
gcloud auth login
gcloud config set project ${GCP_PROJECT_ID}
```

### 2. Configure Environment Variables

Copy and update the production environment file:

```bash
cp .env.example .env.production
```

Edit `.env.production` with your actual values:
- SendGrid API key for email
- Analytics IDs (Google Analytics, GTM)
- Sentry DSN for error monitoring
- API secrets and session keys

### 3. Update Kubernetes Secrets

Edit `k8s/secret.yaml` and replace placeholder values:

```yaml
stringData:
  SENDGRID_API_KEY: "your-actual-sendgrid-key"
  API_SECRET_KEY: "generate-secure-random-key"
  SESSION_SECRET: "generate-secure-random-key"
  CSRF_SECRET: "generate-secure-random-key"
```

**Generate secure keys:**
```bash
openssl rand -base64 32
```

### 4. Test Locally (Recommended)

```bash
# Test the Docker build locally
./scripts/local-test.sh
```

Visit http://localhost:3000 to verify everything works.

### 5. Create GKE Cluster

```bash
# Create a production-ready GKE cluster
./scripts/create-gke-cluster.sh
```

This creates a cluster with:
- Auto-scaling (3-10 nodes)
- Auto-repair and auto-upgrade enabled
- Workload Identity for security
- Shielded nodes
- Monitoring and logging

### 6. Deploy to GKE

```bash
# Deploy the application
./scripts/deploy-to-gke.sh
```

This script will:
1. Build the Docker image
2. Push to Google Container Registry
3. Create Kubernetes resources
4. Deploy the application
5. Set up auto-scaling
6. Configure ingress and SSL

## 📦 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Google Cloud Load Balancer       │
│         (with SSL/TLS termination)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Kubernetes Ingress               │
│         (GCE Ingress Controller)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Kubernetes Service               │
│         (ClusterIP)                      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Deployment (3-10 replicas)       │
│         - Next.js Application            │
│         - Health checks                  │
│         - Resource limits                │
│         - Security context               │
└──────────────────────────────────────────┘
```

## 🔐 Security Configuration

### SSL/TLS Certificate

The deployment uses Google-managed SSL certificates:

```yaml
# k8s/managed-certificate.yaml
domains:
  - vantedgehealth.com
  - www.vantedgehealth.com
```

Certificate provisioning takes 15-60 minutes after DNS is configured.

### Security Headers

Configured in `next.config.ts`:
- Strict-Transport-Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### Container Security

- Runs as non-root user (UID 1001)
- Read-only root filesystem where possible
- Dropped all capabilities
- Security context enforced

## 🌐 DNS Configuration

### 1. Get Ingress IP Address

```bash
kubectl get ingress vantedge-health-ingress -n vantedge-health
```

### 2. Create DNS Records

Add these A records to your DNS provider:

```
Type  Name              Value
A     vantedgehealth.com      <INGRESS_IP>
A     www.vantedgehealth.com  <INGRESS_IP>
```

### 3. Verify DNS Propagation

```bash
dig vantedgehealth.com
dig www.vantedgehealth.com
```

### 4. Check Certificate Status

```bash
kubectl describe managedcertificate vantedge-health-cert -n vantedge-health
```

Wait until status shows "Active" for all domains.

## 📊 Monitoring & Logging

### View Application Logs

```bash
# Stream logs from all pods
kubectl logs -f deployment/vantedge-health -n vantedge-health

# View logs from specific pod
kubectl logs <pod-name> -n vantedge-health
```

### Check Pod Status

```bash
# List all pods
kubectl get pods -n vantedge-health

# Describe a specific pod
kubectl describe pod <pod-name> -n vantedge-health
```

### Monitor Auto-scaling

```bash
# Check HPA status
kubectl get hpa -n vantedge-health

# Watch HPA in real-time
kubectl get hpa -n vantedge-health -w
```

### Health Checks

```bash
# Check application health
curl https://vantedgehealth.com/api/health

# Or from within cluster
kubectl exec -it <pod-name> -n vantedge-health -- curl localhost:3000/api/health
```

## 🔄 Updates & Rollbacks

### Deploy New Version

```bash
# Build and push new image
export VERSION="v1.4.0"
docker build -t gcr.io/${GCP_PROJECT_ID}/vantedge-health:${VERSION} .
docker push gcr.io/${GCP_PROJECT_ID}/vantedge-health:${VERSION}

# Update deployment
kubectl set image deployment/vantedge-health \
  vantedge-health=gcr.io/${GCP_PROJECT_ID}/vantedge-health:${VERSION} \
  -n vantedge-health

# Watch rollout
kubectl rollout status deployment/vantedge-health -n vantedge-health
```

### Rollback Deployment

```bash
# Rollback to previous version
kubectl rollout undo deployment/vantedge-health -n vantedge-health

# Rollback to specific revision
kubectl rollout undo deployment/vantedge-health --to-revision=2 -n vantedge-health

# View rollout history
kubectl rollout history deployment/vantedge-health -n vantedge-health
```

## 🔧 Troubleshooting

### Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n vantedge-health

# Check logs
kubectl logs <pod-name> -n vantedge-health

# Common issues:
# - Image pull errors: Check GCR permissions
# - CrashLoopBackOff: Check environment variables and secrets
# - Pending: Check resource quotas and node capacity
```

### Certificate Not Provisioning

```bash
# Check certificate status
kubectl describe managedcertificate vantedge-health-cert -n vantedge-health

# Common issues:
# - DNS not pointing to ingress IP
# - Domain ownership not verified
# - Wait time (can take up to 60 minutes)
```

### Application Errors

```bash
# Check application logs
kubectl logs -f deployment/vantedge-health -n vantedge-health

# Check health endpoint
kubectl exec -it <pod-name> -n vantedge-health -- curl localhost:3000/api/health

# Common issues:
# - Missing environment variables
# - Incorrect secrets
# - SendGrid API key issues
```

### High Memory/CPU Usage

```bash
# Check resource usage
kubectl top pods -n vantedge-health

# Check HPA status
kubectl get hpa -n vantedge-health

# Adjust resources in k8s/deployment.yaml if needed
```

## 📈 Scaling

### Manual Scaling

```bash
# Scale to specific number of replicas
kubectl scale deployment/vantedge-health --replicas=5 -n vantedge-health
```

### Auto-scaling Configuration

Edit `k8s/hpa.yaml` to adjust:
- Min/max replicas
- CPU/memory thresholds
- Scale up/down policies

```bash
# Apply changes
kubectl apply -f k8s/hpa.yaml
```

## 🧪 Testing in Production

### Smoke Tests

```bash
# Test all marketing pages
curl -I https://vantedgehealth.com/home
curl -I https://vantedgehealth.com/features
curl -I https://vantedgehealth.com/pricing
curl -I https://vantedgehealth.com/contact
curl -I https://vantedgehealth.com/about

# Test API endpoints
curl https://vantedgehealth.com/api/health
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://vantedgehealth.com/

# Using hey
hey -n 1000 -c 10 https://vantedgehealth.com/
```

## 💰 Cost Optimization

### Current Configuration Costs (Estimated)

- **GKE Cluster**: ~$150-300/month (3-10 nodes, e2-standard-2)
- **Load Balancer**: ~$18/month
- **Container Registry**: ~$0.10/GB/month
- **Egress Traffic**: Varies by usage

### Cost Reduction Tips

1. **Use Preemptible Nodes** (for non-critical workloads)
2. **Right-size Resources**: Adjust CPU/memory requests
3. **Enable Cluster Autoscaler**: Scale down during low traffic
4. **Use Committed Use Discounts**: For predictable workloads
5. **Monitor with GCP Cost Management**

## 🔒 HIPAA Compliance Checklist

- [ ] Enable audit logging
- [ ] Configure VPC Service Controls
- [ ] Implement encryption at rest
- [ ] Set up backup and disaster recovery
- [ ] Configure network policies
- [ ] Enable Binary Authorization
- [ ] Set up access controls (IAM)
- [ ] Implement monitoring and alerting
- [ ] Document security procedures
- [ ] Conduct security audit

## 📚 Additional Resources

- [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [GCP Security Best Practices](https://cloud.google.com/security/best-practices)

## 🆘 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Check GCP Console for cluster health
4. Contact DevOps team

## 📝 Maintenance Schedule

- **Daily**: Monitor logs and metrics
- **Weekly**: Review resource usage and costs
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and update security configurations

---

**Last Updated**: February 2026  
**Version**: 1.3.0  
**Maintained by**: Vantedge Health DevOps Team
