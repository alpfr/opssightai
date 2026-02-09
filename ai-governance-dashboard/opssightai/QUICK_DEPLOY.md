# OpsSightAI - Quick Deploy Guide

**Deploy to GCP GKE in 5 minutes!** ⚡

---

## Prerequisites (2 minutes)

```bash
# Install tools (if not already installed)
brew install gcloud kubectl helm docker

# Login to GCP
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID
```

---

## Deploy (3 minutes)

### Option 1: Automated Script (Recommended)

```bash
cd opssightai

# Set environment variables
export GCP_PROJECT_ID="your-project-id"
export DB_PASSWORD="your-secure-password"

# Run deployment script
chmod +x scripts/deploy-to-gke.sh
./scripts/deploy-to-gke.sh
```

**That's it!** The script will:
1. Create GKE cluster (10-15 min)
2. Build and push Docker images
3. Deploy with Helm
4. Provide application URL

---

### Option 2: Manual Deploy

```bash
# 1. Create cluster
gcloud container clusters create opssightai-cluster \
  --region us-central1 \
  --num-nodes 3 \
  --machine-type n1-standard-2

# 2. Get credentials
gcloud container clusters get-credentials opssightai-cluster --region us-central1

# 3. Configure Docker
gcloud auth configure-docker

# 4. Build and push images
cd frontend
docker build -t gcr.io/YOUR_PROJECT_ID/opssightai-frontend:latest .
docker push gcr.io/YOUR_PROJECT_ID/opssightai-frontend:latest

cd ../backend
docker build -t gcr.io/YOUR_PROJECT_ID/opssightai-backend:latest .
docker push gcr.io/YOUR_PROJECT_ID/opssightai-backend:latest

# 5. Deploy with Helm
cd ..
helm install opssightai ./k8s/helm/opssightai \
  --namespace opssightai \
  --create-namespace \
  --set frontend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-frontend \
  --set backend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-backend \
  --set database.secrets.postgresPassword=YOUR_PASSWORD \
  --set backend.secrets.jwtSecret=$(openssl rand -base64 32) \
  --set ingress.className=gce \
  --wait --timeout=10m

# 6. Get application URL
kubectl get ingress -n opssightai
```

---

## Access Application

```bash
# Get load balancer IP
INGRESS_IP=$(kubectl get ingress -n opssightai opssightai-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Open in browser
echo "Application URL: http://$INGRESS_IP"
```

---

## Verify Deployment

```bash
# Check pods
kubectl get pods -n opssightai

# Check services
kubectl get services -n opssightai

# Test health
curl http://$INGRESS_IP/health
curl http://$INGRESS_IP/api/health
```

---

## Useful Commands

```bash
# View logs
kubectl logs -f deployment/opssightai-backend -n opssightai

# Port forward for local access
kubectl port-forward -n opssightai svc/opssightai-frontend 8080:80

# Delete deployment
helm uninstall opssightai -n opssightai

# Delete cluster
gcloud container clusters delete opssightai-cluster --region us-central1
```

---

## Production Deployment

```bash
helm install opssightai ./k8s/helm/opssightai \
  --namespace opssightai \
  --create-namespace \
  --values k8s/helm/opssightai/values-production.yaml \
  --set frontend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-frontend \
  --set backend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-backend \
  --set database.secrets.postgresPassword=YOUR_PASSWORD \
  --set backend.secrets.jwtSecret=YOUR_JWT_SECRET
```

---

## Troubleshooting

**Pods not starting?**
```bash
kubectl describe pod <pod-name> -n opssightai
kubectl logs <pod-name> -n opssightai
```

**Load balancer not ready?**
```bash
kubectl describe ingress opssightai-ingress -n opssightai
```

**Database connection failed?**
```bash
kubectl logs statefulset/opssightai-database -n opssightai
```

---

## Cost Estimate

- **Default**: ~$218/month (3 nodes)
- **Production**: ~$558/month (5 nodes)
- **Staging**: ~$170/month (2 nodes)

---

## Next Steps

1. ✅ Deploy application
2. 🔧 Run database migration
3. 📊 Populate sample data
4. 🌐 Configure DNS (optional)
5. 🔒 Configure SSL/TLS (optional)
6. 📈 Set up monitoring (optional)

---

**Need more details?** See `GKE_DEPLOYMENT_COMPLETE.md`

**Ready to deploy?** Run `./scripts/deploy-to-gke.sh`

