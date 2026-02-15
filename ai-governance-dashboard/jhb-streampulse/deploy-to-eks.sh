#!/bin/bash
set -e

# JHB StreamPulse - AWS EKS Deployment Script
# This script deploys JHB StreamPulse v2.1 with AI capabilities to AWS EKS

echo "=========================================="
echo "JHB StreamPulse - AWS EKS Deployment"
echo "=========================================="
echo ""

# Configuration
CLUSTER_NAME="${EKS_CLUSTER_NAME:-jhb-cluster}"
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID}"
ECR_REPO="${ECR_REPO:-jhb-streampulse}"
IMAGE_TAG="${IMAGE_TAG:-v2.1.0}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install: https://aws.amazon.com/cli/"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Get AWS Account ID if not provided
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "Getting AWS Account ID..."
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo "AWS Account ID: $AWS_ACCOUNT_ID"
fi

# Check if EKS cluster exists
echo ""
echo "Checking EKS cluster: $CLUSTER_NAME in $AWS_REGION..."
if ! aws eks describe-cluster --name "$CLUSTER_NAME" --region "$AWS_REGION" &> /dev/null; then
    echo "❌ EKS cluster '$CLUSTER_NAME' not found in region '$AWS_REGION'"
    echo ""
    echo "To create a new EKS cluster, run:"
    echo "  eksctl create cluster --name $CLUSTER_NAME --region $AWS_REGION --nodes 2 --node-type t3.medium"
    echo ""
    echo "Or specify an existing cluster:"
    echo "  export EKS_CLUSTER_NAME=your-cluster-name"
    echo "  export AWS_REGION=your-region"
    exit 1
fi
echo "✅ EKS cluster found"

# Update kubeconfig
echo ""
echo "Updating kubeconfig..."
aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$AWS_REGION"
echo "✅ Kubeconfig updated"

# Create ECR repository if it doesn't exist
echo ""
echo "Checking ECR repository..."
if ! aws ecr describe-repositories --repository-names "$ECR_REPO" --region "$AWS_REGION" &> /dev/null; then
    echo "Creating ECR repository: $ECR_REPO..."
    aws ecr create-repository --repository-name "$ECR_REPO" --region "$AWS_REGION"
    echo "✅ ECR repository created"
else
    echo "✅ ECR repository exists"
fi

# Build and push Docker image to ECR
echo ""
echo "Building and pushing Docker image to ECR..."
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG"

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Build image
echo "Building Docker image..."
docker build -t "$ECR_REPO:$IMAGE_TAG" .

# Tag image
echo "Tagging image for ECR..."
docker tag "$ECR_REPO:$IMAGE_TAG" "$ECR_URI"

# Push image
echo "Pushing image to ECR..."
docker push "$ECR_URI"
echo "✅ Image pushed to ECR: $ECR_URI"

# Update deployment manifest with ECR image
echo ""
echo "Updating deployment manifest with ECR image..."
sed -i.bak "s|gcr.io/alpfr-splunk-integration/jhb-streampulse:v2.1.0|$ECR_URI|g" eks/deployment.yaml
echo "✅ Deployment manifest updated"

# Create namespace
echo ""
echo "Creating namespace..."
kubectl apply -f eks/namespace.yaml
echo "✅ Namespace created"

# Create secret for Anthropic API key
echo ""
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY not set. AI features will be disabled."
    echo "To enable AI features, set the environment variable:"
    echo "  export ANTHROPIC_API_KEY='your-api-key-here'"
    echo ""
    read -p "Continue without AI features? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    # Create a dummy secret
    kubectl create secret generic jhb-streampulse-ai-secret \
        --from-literal=ANTHROPIC_API_KEY='' \
        -n jhb-streampulse \
        --dry-run=client -o yaml | kubectl apply -f -
else
    echo "Creating secret for Anthropic API key..."
    kubectl create secret generic jhb-streampulse-ai-secret \
        --from-literal=ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
        -n jhb-streampulse \
        --dry-run=client -o yaml | kubectl apply -f -
    echo "✅ Secret created with AI key"
fi

# Apply Kubernetes manifests
echo ""
echo "Applying Kubernetes manifests..."
kubectl apply -f eks/service-account.yaml
kubectl apply -f eks/configmap.yaml
kubectl apply -f eks/pvc.yaml
kubectl apply -f eks/deployment.yaml
kubectl apply -f eks/service.yaml
kubectl apply -f eks/hpa.yaml
kubectl apply -f eks/pdb.yaml
echo "✅ All manifests applied"

# Wait for deployment
echo ""
echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/jhb-streampulse -n jhb-streampulse --timeout=5m

# Get service endpoint
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Getting service endpoint..."
echo "Waiting for LoadBalancer to be provisioned (this may take 2-3 minutes)..."
sleep 10

EXTERNAL_IP=""
for i in {1..30}; do
    EXTERNAL_IP=$(kubectl get svc jhb-streampulse -n jhb-streampulse -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    if [ -n "$EXTERNAL_IP" ]; then
        break
    fi
    echo "Waiting for LoadBalancer... ($i/30)"
    sleep 10
done

if [ -n "$EXTERNAL_IP" ]; then
    echo ""
    echo "✅ JHB StreamPulse is now accessible at:"
    echo "   http://$EXTERNAL_IP"
    echo ""
    echo "📊 Dashboard: http://$EXTERNAL_IP"
    echo "🔌 API: http://$EXTERNAL_IP/api/data"
    echo "📈 Stats: http://$EXTERNAL_IP/api/stats"
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        echo "✨ AI Insights: ENABLED"
    else
        echo "💡 AI Insights: DISABLED (set ANTHROPIC_API_KEY to enable)"
    fi
else
    echo ""
    echo "⚠️  LoadBalancer endpoint not ready yet. Check status with:"
    echo "   kubectl get svc jhb-streampulse -n jhb-streampulse"
fi

echo ""
echo "Useful commands:"
echo "  kubectl get pods -n jhb-streampulse"
echo "  kubectl logs -n jhb-streampulse -l app=jhb-streampulse -f"
echo "  kubectl describe svc jhb-streampulse -n jhb-streampulse"
echo ""
echo "To update the API key later:"
echo "  kubectl create secret generic jhb-streampulse-ai-secret \\"
echo "    --from-literal=ANTHROPIC_API_KEY='your-new-key' \\"
echo "    -n jhb-streampulse --dry-run=client -o yaml | kubectl apply -f -"
echo "  kubectl rollout restart deployment/jhb-streampulse -n jhb-streampulse"
echo ""
