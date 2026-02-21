# OpsSightAI - Cloud Deployment Guide

## 🚀 Deploy to AWS EKS or GCP GKE

This guide covers deploying the complete OpsSightAI stack (Frontend, Backend, Database) to either AWS EKS or GCP GKE.

---

## 📦 What We're Deploying

### Application Stack
1. **Frontend** - React application (port 4001)
2. **Backend** - Node.js/Express API (port 4000)
3. **Database** - TimescaleDB/PostgreSQL (port 5432)

### Architecture
```
Internet → Load Balancer → Ingress → Frontend (React)
                                   ↓
                                Backend (Node.js/Express)
                                   ↓
                                Database (TimescaleDB)
```

---

## 🎯 Quick Start

### Option 1: AWS EKS (Recommended for AWS users)
```bash
# 1. Deploy to EKS
./scripts/deploy-to-eks.sh

# 2. Get application URL
kubectl get ingress -n opssightai
```

### Option 2: GCP GKE (Recommended for GCP users)
```bash
# 1. Deploy to GKE
./scripts/deploy-to-gke.sh

# 2. Get application URL
kubectl get ingress -n opssightai
```

---

## 📋 Prerequisites

### Common Requirements
- **kubectl** v1.28+ - [Install](https://kubernetes.io/docs/tasks/tools/)
- **Helm** v3.12+ - [Install](https://helm.sh/docs/intro/install/)
- **Docker** - [Install](https://docs.docker.com/get-docker/)

### For AWS EKS
- **AWS CLI** v2.x - [Install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **eksctl** v0.150+ - [Install](https://eksctl.io/introduction/#installation)
- AWS Account with appropriate permissions

### For GCP GKE
- **gcloud CLI** - [Install](https://cloud.google.com/sdk/docs/install)
- GCP Project with Kubernetes Engine API enabled
- GCP Account with appropriate permissions

---

## 🔧 AWS EKS Deployment

### Step 1: Configure AWS
```bash
# Configure AWS CLI
aws configure

# Verify configuration
aws sts get-caller-identity
```

### Step 2: Create EKS Cluster
```bash
# Create cluster (15-20 minutes)
eksctl create cluster \
  --name opssightai-cluster \
  --region us-west-2 \
  --version 1.28 \
  --nodegroup-name opssightai-nodes \
  --node-type t3.large \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10 \
  --with-oidc \
  --managed

# Update kubeconfig
aws eks update-kubeconfig --region us-west-2 --name opssightai-cluster

# Verify cluster
kubectl get nodes
```

### Step 3: Create ECR Repositories
```bash
# Create repositories for frontend and backend
aws ecr create-repository --repository-name opssightai-frontend --region us-west-2
aws ecr create-repository --repository-name opssightai-backend --region us-west-2

# Get repository URIs
FRONTEND_ECR=$(aws ecr describe-repositories --repository-names opssightai-frontend --region us-west-2 --query 'repositories[0].repositoryUri' --output text)
BACKEND_ECR=$(aws ecr describe-repositories --repository-names opssightai-backend --region us-west-2 --query 'repositories[0].repositoryUri' --output text)

echo "Frontend ECR: $FRONTEND_ECR"
echo "Backend ECR: $BACKEND_ECR"
```

### Step 4: Build and Push Images
```bash
# Login to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $FRONTEND_ECR

# Build and push frontend
cd frontend
docker build -t opssightai-frontend:latest .
docker tag opssightai-frontend:latest $FRONTEND_ECR:latest
docker push $FRONTEND_ECR:latest

# Build and push backend
cd ../backend
docker build -t opssightai-backend:latest .
docker tag opssightai-backend:latest $BACKEND_ECR:latest
docker push $BACKEND_ECR:latest
```

### Step 5: Install AWS Load Balancer Controller
```bash
# Create IAM service account
eksctl create iamserviceaccount \
  --cluster=opssightai-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name "AmazonEKSLoadBalancerControllerRole" \
  --attach-policy-arn=arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess \
  --approve \
  --region us-west-2

# Add Helm repository
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=opssightai-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=us-west-2
```

### Step 6: Deploy OpsSightAI
```bash
# Create namespace
kubectl create namespace opssightai

# Create secrets for database
kubectl create secret generic opssightai-db-secret \
  --from-literal=postgres-password=your-secure-password \
  --namespace=opssightai

# Deploy using Helm
helm install opssightai ./k8s/helm/opssightai \
  --namespace opssightai \
  --set frontend.image.repository=$FRONTEND_ECR \
  --set frontend.image.tag=latest \
  --set backend.image.repository=$BACKEND_ECR \
  --set backend.image.tag=latest \
  --set database.password=your-secure-password \
  --wait --timeout=10m
```

### Step 7: Get Application URL
```bash
# Get load balancer URL
kubectl get ingress -n opssightai opssightai-ingress \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Or use port-forward for testing
kubectl port-forward -n opssightai svc/opssightai-frontend 8080:80
```

---

## 🔧 GCP GKE Deployment

### Step 1: Configure GCP
```bash
# Login to GCP
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable container.googleapis.com
gcloud services enable compute.googleapis.com
```

### Step 2: Create GKE Cluster
```bash
# Create cluster (10-15 minutes)
gcloud container clusters create opssightai-cluster \
  --region us-central1 \
  --num-nodes 3 \
  --machine-type n1-standard-2 \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 10 \
  --enable-autorepair \
  --enable-autoupgrade \
  --release-channel regular

# Get credentials
gcloud container clusters get-credentials opssightai-cluster --region us-central1

# Verify cluster
kubectl get nodes
```

### Step 3: Create GCR Repositories
```bash
# Enable Container Registry
gcloud services enable containerregistry.googleapis.com

# Set project for Docker
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

### Step 4: Deploy OpsSightAI
```bash
# Create namespace
kubectl create namespace opssightai

# Create secrets for database
kubectl create secret generic opssightai-db-secret \
  --from-literal=postgres-password=your-secure-password \
  --namespace=opssightai

# Deploy using Helm
helm install opssightai ./k8s/helm/opssightai \
  --namespace opssightai \
  --set frontend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-frontend \
  --set frontend.image.tag=latest \
  --set backend.image.repository=gcr.io/YOUR_PROJECT_ID/opssightai-backend \
  --set backend.image.tag=latest \
  --set database.password=your-secure-password \
  --set ingress.className=gce \
  --wait --timeout=10m
```

### Step 5: Get Application URL
```bash
# Get load balancer IP
kubectl get ingress -n opssightai opssightai-ingress \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Or use port-forward for testing
kubectl port-forward -n opssightai svc/opssightai-frontend 8080:80
```

---

## 📁 Kubernetes Manifests

I'll create the necessary Kubernetes manifests in the next step. The structure will be:

```
k8s/
├── helm/
│   └── opssightai/
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-production.yaml
│       ├── values-staging.yaml
│       └── templates/
│           ├── namespace.yaml
│           ├── database-statefulset.yaml
│           ├── database-service.yaml
│           ├── backend-deployment.yaml
│           ├── backend-service.yaml
│           ├── frontend-deployment.yaml
│           ├── frontend-service.yaml
│           ├── ingress.yaml
│           ├── configmap.yaml
│           ├── secrets.yaml
│           └── hpa.yaml
└── scripts/
    ├── deploy-to-eks.sh
    └── deploy-to-gke.sh
```

---

## 🔒 Security Best Practices

### 1. Use Secrets for Sensitive Data
```bash
# Create secrets
kubectl create secret generic opssightai-db-secret \
  --from-literal=postgres-password=your-secure-password \
  --from-literal=postgres-user=postgres \
  --namespace=opssightai

kubectl create secret generic opssightai-backend-secret \
  --from-literal=jwt-secret=your-jwt-secret \
  --namespace=opssightai
```

### 2. Enable Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: opssightai-network-policy
  namespace: opssightai
spec:
  podSelector:
    matchLabels:
      app: opssightai
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: opssightai
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: opssightai
```

### 3. Use Pod Security Standards
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: opssightai
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

---

## 📊 Monitoring and Logging

### Install Prometheus and Grafana
```bash
# Add Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install monitoring stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=admin123
```

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/opssightai-backend -n opssightai

# Frontend logs
kubectl logs -f deployment/opssightai-frontend -n opssightai

# Database logs
kubectl logs -f statefulset/opssightai-database -n opssightai
```

---

## 🔄 CI/CD Integration

### GitHub Actions for AWS EKS
```yaml
name: Deploy to EKS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      
      - name: Login to ECR
        run: |
          aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
      
      - name: Build and push images
        run: |
          docker build -t ${{ secrets.ECR_REGISTRY }}/opssightai-frontend:${{ github.sha }} ./frontend
          docker push ${{ secrets.ECR_REGISTRY }}/opssightai-frontend:${{ github.sha }}
          
          docker build -t ${{ secrets.ECR_REGISTRY }}/opssightai-backend:${{ github.sha }} ./backend
          docker push ${{ secrets.ECR_REGISTRY }}/opssightai-backend:${{ github.sha }}
      
      - name: Deploy to EKS
        run: |
          aws eks update-kubeconfig --region us-west-2 --name opssightai-cluster
          helm upgrade --install opssightai ./k8s/helm/opssightai \
            --namespace opssightai \
            --set frontend.image.tag=${{ github.sha }} \
            --set backend.image.tag=${{ github.sha }} \
            --wait --timeout=10m
```

---

## 🚨 Troubleshooting

### Common Issues

#### Pods Not Starting
```bash
# Check pod status
kubectl get pods -n opssightai

# Describe pod
kubectl describe pod <pod-name> -n opssightai

# Check logs
kubectl logs <pod-name> -n opssightai
```

#### Database Connection Issues
```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql -h opssightai-database.opssightai.svc.cluster.local -U postgres -d opssightai

# Check database logs
kubectl logs statefulset/opssightai-database -n opssightai
```

#### Load Balancer Not Working
```bash
# Check ingress
kubectl describe ingress opssightai-ingress -n opssightai

# Check service
kubectl describe service opssightai-frontend -n opssightai

# For AWS: Check ALB controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# For GCP: Check ingress events
kubectl get events -n opssightai --sort-by='.lastTimestamp'
```

---

## 💰 Cost Optimization

### Use Spot/Preemptible Instances

**AWS EKS:**
```bash
eksctl create nodegroup \
  --cluster opssightai-cluster \
  --name spot-nodes \
  --node-type t3.large \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 5 \
  --spot
```

**GCP GKE:**
```bash
gcloud container node-pools create spot-pool \
  --cluster opssightai-cluster \
  --region us-central1 \
  --machine-type n1-standard-2 \
  --num-nodes 2 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 5 \
  --preemptible
```

---

## 🗑️ Cleanup

### Delete Application
```bash
# Using Helm
helm uninstall opssightai -n opssightai

# Delete namespace
kubectl delete namespace opssightai
```

### Delete Cluster

**AWS EKS:**
```bash
eksctl delete cluster --name opssightai-cluster --region us-west-2
```

**GCP GKE:**
```bash
gcloud container clusters delete opssightai-cluster --region us-central1
```

---

## 📚 Next Steps

1. **Create Helm Chart** - I'll create the complete Helm chart in the next step
2. **Create Deployment Scripts** - Automated deployment scripts for both platforms
3. **Configure SSL/TLS** - Set up HTTPS with Let's Encrypt or cloud certificates
4. **Set up Monitoring** - Configure Prometheus, Grafana, and alerting
5. **Configure Backups** - Set up automated database backups

---

**Ready to deploy?** Let me know if you want to proceed with AWS EKS or GCP GKE, and I'll create the complete Helm chart and deployment scripts!
