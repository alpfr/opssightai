#!/bin/bash

# JHB StreamPulse - GKE Deployment Script
# Deploys to Google Kubernetes Engine

set -e

# Configuration
PROJECT_ID="alpfr-splunk-integration"
REGION="us-central1"
CLUSTER_NAME="sermon-slicer-cluster"
IMAGE_NAME="jhb-streampulse"
VERSION="v2.0.0"

echo "🚀 JHB StreamPulse - GKE Deployment"
echo "===================================="
echo ""

# Step 1: Set GCP project
echo "📋 Step 1: Setting GCP project..."
gcloud config set project $PROJECT_ID

# Step 2: Get cluster credentials
echo "🔐 Step 2: Getting cluster credentials..."
gcloud container clusters get-credentials $CLUSTER_NAME --region=$REGION

# Step 3: Build Docker image using Cloud Build
echo "🏗️  Step 3: Building Docker image..."
echo "Using Google Cloud Build for correct architecture (AMD64)..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$IMAGE_NAME:$VERSION .
gcloud builds submit --tag gcr.io/$PROJECT_ID/$IMAGE_NAME:latest .

echo "✅ Image built: gcr.io/$PROJECT_ID/$IMAGE_NAME:$VERSION"

# Step 4: Apply Kubernetes manifests
echo "☸️  Step 4: Deploying to Kubernetes..."

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/managed-certificate.yaml
kubectl apply -f k8s/ingress.yaml

echo ""
echo "⏳ Waiting for deployment to be ready..."
kubectl rollout status deployment/jhb-streampulse -n jhb-streampulse --timeout=5m

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Deployment Status:"
echo "===================="
kubectl get pods -n jhb-streampulse
echo ""
kubectl get service -n jhb-streampulse
echo ""
kubectl get ingress -n jhb-streampulse
echo ""

echo "🔍 To check logs:"
echo "kubectl logs -f deployment/jhb-streampulse -n jhb-streampulse"
echo ""
echo "🌐 To get external IP:"
echo "kubectl get ingress jhb-streampulse-ingress -n jhb-streampulse"
echo ""
echo "📈 To check HPA status:"
echo "kubectl get hpa -n jhb-streampulse"
echo ""
echo "🎉 JHB StreamPulse is now deployed!"
