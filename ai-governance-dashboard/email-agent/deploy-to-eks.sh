#!/bin/bash

# Email Agent Platform - EKS Deployment Script
# This script deploys the application to AWS EKS cluster

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="713220200108"
EKS_CLUSTER_NAME="jhb-streampulse-cluster"
ECR_BACKEND_REPO="email-agent-backend"
ECR_FRONTEND_REPO="email-agent-frontend"
NAMESPACE="email-agent"

echo "========================================="
echo "Email Agent Platform - EKS Deployment"
echo "========================================="
echo ""

# Check if kubectl is configured
echo "Checking kubectl configuration..."
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: kubectl is not configured or cluster is not accessible"
    echo "Run: aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER_NAME"
    exit 1
fi

echo "✓ kubectl is configured"
echo ""

# Check if AWS CLI is configured
echo "Checking AWS CLI configuration..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS CLI is not configured"
    exit 1
fi

echo "✓ AWS CLI is configured"
echo ""

# Login to ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "✓ Logged in to ECR"
echo ""

# Create ECR repositories if they don't exist
echo "Creating ECR repositories..."
aws ecr describe-repositories --repository-names $ECR_BACKEND_REPO --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $ECR_BACKEND_REPO --region $AWS_REGION

aws ecr describe-repositories --repository-names $ECR_FRONTEND_REPO --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $ECR_FRONTEND_REPO --region $AWS_REGION

echo "✓ ECR repositories ready"
echo ""

# Build and push backend image
echo "Building backend Docker image..."
cd backend
docker build -t $ECR_BACKEND_REPO:latest .
docker tag $ECR_BACKEND_REPO:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPO:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPO:latest
cd ..

echo "✓ Backend image pushed to ECR"
echo ""

# Build and push frontend image
echo "Building frontend Docker image..."
cd frontend
docker build -t $ECR_FRONTEND_REPO:latest .
docker tag $ECR_FRONTEND_REPO:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_FRONTEND_REPO:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_FRONTEND_REPO:latest
cd ..

echo "✓ Frontend image pushed to ECR"
echo ""

# Apply Kubernetes manifests
echo "Deploying to Kubernetes..."

# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create service account and RBAC
kubectl apply -f k8s/serviceaccount.yaml

# Create ConfigMap
kubectl apply -f k8s/configmap.yaml

# Check if secret exists
if ! kubectl get secret email-agent-secrets -n $NAMESPACE &> /dev/null; then
    echo ""
    echo "⚠️  WARNING: Secret 'email-agent-secrets' not found!"
    echo "Please create k8s/secret.yaml from k8s/secret.yaml.example"
    echo "and apply it with: kubectl apply -f k8s/secret.yaml"
    echo ""
    read -p "Do you want to continue without secrets? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Deploy PostgreSQL
kubectl apply -f k8s/postgres-deployment.yaml

# Deploy Redis
kubectl apply -f k8s/redis-deployment.yaml

# Wait for databases to be ready
echo "Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=120s

echo "✓ Databases are ready"
echo ""

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy HPA
kubectl apply -f k8s/hpa.yaml

# Deploy Ingress
kubectl apply -f k8s/ingress.yaml

echo "✓ All resources deployed"
echo ""

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available deployment/email-agent-backend -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=available deployment/email-agent-frontend -n $NAMESPACE --timeout=300s

echo "✓ Deployments are ready"
echo ""

# Get ingress URL
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Getting ingress URL..."
INGRESS_URL=$(kubectl get ingress email-agent-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

if [ -z "$INGRESS_URL" ]; then
    echo "Ingress is being provisioned. This may take a few minutes."
    echo "Run this command to get the URL:"
    echo "kubectl get ingress email-agent-ingress -n $NAMESPACE"
else
    echo "Application URL: http://$INGRESS_URL"
fi

echo ""
echo "Useful commands:"
echo "  View pods:        kubectl get pods -n $NAMESPACE"
echo "  View services:    kubectl get svc -n $NAMESPACE"
echo "  View ingress:     kubectl get ingress -n $NAMESPACE"
echo "  View logs:        kubectl logs -f deployment/email-agent-backend -n $NAMESPACE"
echo "  Scale backend:    kubectl scale deployment email-agent-backend --replicas=3 -n $NAMESPACE"
echo ""
