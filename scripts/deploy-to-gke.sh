#!/bin/bash

# OpsSightAI - GCP GKE Deployment Script
# This script automates the complete deployment to Google Kubernetes Engine

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-""}
CLUSTER_NAME=${CLUSTER_NAME:-"opssightai-cluster"}
REGION=${GCP_REGION:-"us-central1"}
ZONE=${GCP_ZONE:-"us-central1-a"}
NAMESPACE="opssightai"
DB_PASSWORD=${DB_PASSWORD:-""}
JWT_SECRET=${JWT_SECRET:-""}

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║         OpsSightAI - GCP GKE Deployment Script              ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print step
print_step() {
    echo -e "\n${GREEN}==>${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

# Check prerequisites
print_step "Checking prerequisites..."

if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    print_error "kubectl not found. Please install: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

if ! command -v helm &> /dev/null; then
    print_error "helm not found. Please install: https://helm.sh/docs/intro/install/"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "docker not found. Please install: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✓${NC} All prerequisites installed"

# Get GCP Project ID if not set
if [ -z "$PROJECT_ID" ]; then
    print_step "Getting GCP Project ID..."
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$PROJECT_ID" ]; then
        print_error "No GCP project set. Please run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Using GCP Project: $PROJECT_ID"

# Get database password if not set
if [ -z "$DB_PASSWORD" ]; then
    echo ""
    read -sp "Enter database password (will be hidden): " DB_PASSWORD
    echo ""
    
    if [ -z "$DB_PASSWORD" ]; then
        print_error "Database password is required"
        exit 1
    fi
fi

# Generate JWT secret if not set
if [ -z "$JWT_SECRET" ]; then
    print_step "Generating JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}✓${NC} JWT secret generated"
fi

# Confirm deployment
echo ""
echo -e "${YELLOW}Deployment Configuration:${NC}"
echo "  Project ID:    $PROJECT_ID"
echo "  Cluster Name:  $CLUSTER_NAME"
echo "  Region:        $REGION"
echo "  Namespace:     $NAMESPACE"
echo ""

# Enable required APIs
print_step "Enabling required GCP APIs..."
gcloud services enable container.googleapis.com --project=$PROJECT_ID
gcloud services enable compute.googleapis.com --project=$PROJECT_ID
gcloud services enable containerregistry.googleapis.com --project=$PROJECT_ID
echo -e "${GREEN}✓${NC} APIs enabled"

# Check if cluster exists
print_step "Checking if cluster exists..."
if gcloud container clusters describe $CLUSTER_NAME --zone=$ZONE --project=$PROJECT_ID &>/dev/null; then
    echo -e "${YELLOW}!${NC} Cluster $CLUSTER_NAME already exists, using existing cluster."
    CLUSTER_EXISTS=true
else
    CLUSTER_EXISTS=false
fi

# Create GKE cluster if it doesn't exist
if [ "$CLUSTER_EXISTS" = false ]; then
    print_step "Creating GKE cluster (this will take 10-15 minutes)..."
    
    gcloud container clusters create $CLUSTER_NAME \
        --zone=$ZONE \
        --num-nodes=2 \
        --machine-type=n1-standard-2 \
        --disk-type=pd-standard \
        --disk-size=50 \
        --enable-autoscaling \
        --min-nodes=2 \
        --max-nodes=10 \
        --enable-autorepair \
        --enable-autoupgrade \
        --release-channel=regular \
        --enable-ip-alias \
        --network=default \
        --subnetwork=default \
        --project=$PROJECT_ID
    
    echo -e "${GREEN}✓${NC} Cluster created successfully"
else
    echo -e "${GREEN}✓${NC} Using existing cluster"
fi

# Get cluster credentials
print_step "Getting cluster credentials..."
gcloud container clusters get-credentials $CLUSTER_NAME --zone=$ZONE --project=$PROJECT_ID
echo -e "${GREEN}✓${NC} Credentials configured"

# Verify cluster connection
print_step "Verifying cluster connection..."
kubectl cluster-info
kubectl get nodes
echo -e "${GREEN}✓${NC} Cluster is accessible"

# Configure Docker for GCR
print_step "Configuring Docker for Google Container Registry..."
gcloud auth configure-docker --quiet
echo -e "${GREEN}✓${NC} Docker configured for GCR"

# Build and push frontend image
print_step "Building and pushing frontend image..."
cd frontend

docker buildx build --platform linux/amd64 -t gcr.io/$PROJECT_ID/opssightai-frontend:latest \
    --build-arg REACT_APP_API_URL=/api \
    --push .
echo -e "${GREEN}✓${NC} Frontend image pushed to GCR"

cd ..

# Build and push backend image
print_step "Building and pushing backend image..."
cd backend

docker buildx build --platform linux/amd64 -t gcr.io/$PROJECT_ID/opssightai-backend:latest --push .
echo -e "${GREEN}✓${NC} Backend image pushed to GCR"

cd ..

# Create namespace
print_step "Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
echo -e "${GREEN}✓${NC} Namespace created"



# Deploy with Helm
print_step "Deploying OpsSightAI with Helm..."

helm upgrade --install opssightai ./k8s/helm/opssightai \
    --namespace=$NAMESPACE \
    --set frontend.image.repository=gcr.io/$PROJECT_ID/opssightai-frontend \
    --set frontend.image.tag=latest \
    --set backend.image.repository=gcr.io/$PROJECT_ID/opssightai-backend \
    --set backend.image.tag=latest \
    --set database.secrets.postgresPassword=$DB_PASSWORD \
    --set database.persistence.storageClass=standard \
    --set backend.secrets.jwtSecret=$JWT_SECRET \
    --set namespace.create=false \
    --set ingress.className=gce \
    --set ingress.annotations."kubernetes\.io/ingress\.class"=gce \
    --wait --timeout=10m

echo -e "${GREEN}✓${NC} Application deployed"

# Wait for pods to be ready
print_step "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=opssightai --namespace=$NAMESPACE --timeout=300s
echo -e "${GREEN}✓${NC} All pods are ready"

# Get application URL
print_step "Getting application URL..."
echo ""
echo -e "${YELLOW}Waiting for load balancer to be provisioned (this may take a few minutes)...${NC}"

for i in {1..30}; do
    INGRESS_IP=$(kubectl get ingress -n $NAMESPACE opssightai-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    
    if [ ! -z "$INGRESS_IP" ]; then
        break
    fi
    
    echo -n "."
    sleep 10
done

echo ""

if [ -z "$INGRESS_IP" ]; then
    print_warning "Load balancer IP not yet available. Check status with:"
    echo "  kubectl get ingress -n $NAMESPACE"
else
    echo -e "${GREEN}✓${NC} Load balancer provisioned"
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║                  Deployment Successful! 🎉                   ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Application URL:${NC} http://$INGRESS_IP"
    echo -e "${YELLOW}API URL:${NC} http://$INGRESS_IP/api"
    echo ""
    echo -e "${YELLOW}Health Check:${NC}"
    echo "  curl http://$INGRESS_IP/health"
    echo ""
fi

# Display useful commands
echo -e "${YELLOW}Useful Commands:${NC}"
echo ""
echo "  # View pods"
echo "  kubectl get pods -n $NAMESPACE"
echo ""
echo "  # View services"
echo "  kubectl get services -n $NAMESPACE"
echo ""
echo "  # View ingress"
echo "  kubectl get ingress -n $NAMESPACE"
echo ""
echo "  # View logs (backend)"
echo "  kubectl logs -f deployment/opssightai-backend -n $NAMESPACE"
echo ""
echo "  # View logs (frontend)"
echo "  kubectl logs -f deployment/opssightai-frontend -n $NAMESPACE"
echo ""
echo "  # Port forward for local access"
echo "  kubectl port-forward -n $NAMESPACE svc/opssightai-frontend 8080:80"
echo ""
echo "  # Delete deployment"
echo "  helm uninstall opssightai -n $NAMESPACE"
echo ""

# Save deployment info
print_step "Saving deployment information..."
cat > deployment-info.txt <<EOF
OpsSightAI GKE Deployment Information
=====================================

Deployment Date: $(date)
Project ID: $PROJECT_ID
Cluster Name: $CLUSTER_NAME
Region: $REGION
Namespace: $NAMESPACE

Application URL: http://$INGRESS_IP
API URL: http://$INGRESS_IP/api

Cluster Info:
  kubectl cluster-info

View Resources:
  kubectl get all -n $NAMESPACE

Access Application:
  kubectl port-forward -n $NAMESPACE svc/opssightai-frontend 8080:80
  Then visit: http://localhost:8080

Delete Deployment:
  helm uninstall opssightai -n $NAMESPACE
  
Delete Cluster:
  gcloud container clusters delete $CLUSTER_NAME --zone=$ZONE --project=$PROJECT_ID
EOF

echo -e "${GREEN}✓${NC} Deployment info saved to deployment-info.txt"

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
