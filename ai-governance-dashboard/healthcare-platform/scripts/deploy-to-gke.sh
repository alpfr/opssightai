#!/bin/bash

# Vantedge Health - GKE Deployment Script
# This script deploys the healthcare platform to Google Kubernetes Engine

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
CLUSTER_NAME="${GKE_CLUSTER_NAME:-vantedge-health-cluster}"
IMAGE_NAME="gcr.io/${PROJECT_ID}/vantedge-health"
VERSION="${VERSION:-latest}"

echo -e "${GREEN}=== Vantedge Health GKE Deployment ===${NC}"
echo ""

# Check if required tools are installed
command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}Error: gcloud CLI is required but not installed.${NC}" >&2; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}Error: kubectl is required but not installed.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Error: docker is required but not installed.${NC}" >&2; exit 1; }

# Validate environment variables
if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo -e "${RED}Error: Please set GCP_PROJECT_ID environment variable${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Authenticating with GCP...${NC}"
gcloud auth configure-docker

echo -e "${YELLOW}Step 2: Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:${VERSION} -t ${IMAGE_NAME}:latest .

echo -e "${YELLOW}Step 3: Pushing image to Google Container Registry...${NC}"
docker push ${IMAGE_NAME}:${VERSION}
docker push ${IMAGE_NAME}:latest

echo -e "${YELLOW}Step 4: Getting GKE cluster credentials...${NC}"
gcloud container clusters get-credentials ${CLUSTER_NAME} --region=${REGION} --project=${PROJECT_ID}

echo -e "${YELLOW}Step 5: Creating namespace...${NC}"
kubectl apply -f k8s/namespace.yaml

echo -e "${YELLOW}Step 6: Creating ConfigMap...${NC}"
kubectl apply -f k8s/configmap.yaml

echo -e "${YELLOW}Step 7: Creating Secrets...${NC}"
echo -e "${RED}WARNING: Make sure to update k8s/secret.yaml with actual values before deploying!${NC}"
read -p "Have you updated the secrets? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${RED}Deployment cancelled. Please update secrets first.${NC}"
    exit 1
fi
kubectl apply -f k8s/secret.yaml

echo -e "${YELLOW}Step 8: Deploying application...${NC}"
# Update deployment with correct image
sed "s|YOUR_PROJECT_ID|${PROJECT_ID}|g" k8s/deployment.yaml | kubectl apply -f -

echo -e "${YELLOW}Step 9: Creating Service...${NC}"
kubectl apply -f k8s/service.yaml

echo -e "${YELLOW}Step 10: Setting up Horizontal Pod Autoscaler...${NC}"
kubectl apply -f k8s/hpa.yaml

echo -e "${YELLOW}Step 11: Creating Managed Certificate...${NC}"
kubectl apply -f k8s/managed-certificate.yaml

echo -e "${YELLOW}Step 12: Creating Ingress...${NC}"
kubectl apply -f k8s/ingress.yaml

echo ""
echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo ""
echo "Checking deployment status..."
kubectl rollout status deployment/vantedge-health -n vantedge-health

echo ""
echo "Getting service information..."
kubectl get services -n vantedge-health
kubectl get ingress -n vantedge-health

echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Wait for the managed certificate to provision (can take 15-60 minutes)"
echo "2. Point your domain DNS to the Ingress IP address"
echo "3. Monitor deployment: kubectl get pods -n vantedge-health"
echo "4. View logs: kubectl logs -f deployment/vantedge-health -n vantedge-health"
echo ""
echo -e "${YELLOW}To check certificate status:${NC}"
echo "kubectl describe managedcertificate vantedge-health-cert -n vantedge-health"
