#!/bin/bash
set -e

# JHB StreamPulse - EKS Deployment (using existing GCR image)
# This script deploys using the existing image from GCR

echo "=========================================="
echo "JHB StreamPulse - AWS EKS Deployment"
echo "=========================================="
echo ""

# Configuration
CLUSTER_NAME="${EKS_CLUSTER_NAME:-jhb-streampulse-cluster}"
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="jhb-streampulse"
IMAGE_TAG="v2.1.0"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"
GCR_IMAGE="gcr.io/alpfr-splunk-integration/jhb-streampulse:v2.1.0"

echo "Using existing GCR image: $GCR_IMAGE"
echo "AWS Account: $AWS_ACCOUNT_ID"
echo "Cluster: $CLUSTER_NAME"
echo "Region: $AWS_REGION"
echo ""

# Update kubeconfig
echo "Updating kubeconfig..."
aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$AWS_REGION"
echo "✅ Kubeconfig updated"
echo ""

# Create namespace
echo "Creating namespace..."
kubectl apply -f eks/namespace.yaml
echo "✅ Namespace created"
echo ""

# Create secret for Anthropic API key
echo "Creating secret for Anthropic API key..."
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY not set. AI features will be disabled."
    kubectl create secret generic jhb-streampulse-ai-secret \
        --from-literal=ANTHROPIC_API_KEY='' \
        -n jhb-streampulse \
        --dry-run=client -o yaml | kubectl apply -f -
else
    kubectl create secret generic jhb-streampulse-ai-secret \
        --from-literal=ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
        -n jhb-streampulse \
        --dry-run=client -o yaml | kubectl apply -f -
    echo "✅ Secret created with AI key"
fi
echo ""

# Update deployment to use GCR image
echo "Updating deployment manifest to use GCR image..."
sed "s|gcr.io/alpfr-splunk-integration/jhb-streampulse:v2.1.0|$GCR_IMAGE|g" eks/deployment.yaml > /tmp/deployment-eks.yaml
echo "✅ Deployment manifest updated"
echo ""

# Apply Kubernetes manifests
echo "Applying Kubernetes manifests..."
kubectl apply -f eks/service-account.yaml
kubectl apply -f eks/configmap.yaml
kubectl apply -f eks/pvc.yaml
kubectl apply -f /tmp/deployment-eks.yaml
kubectl apply -f eks/service.yaml
kubectl apply -f eks/hpa.yaml
kubectl apply -f eks/pdb.yaml
echo "✅ All manifests applied"
echo ""

# Wait for deployment
echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/jhb-streampulse -n jhb-streampulse --timeout=5m

# Create gp3 storage class
echo ""
echo "Creating gp3 storage class..."
cat <<EOF | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  encrypted: "true"
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
EOF

# Mark gp2 as non-default
kubectl annotate storageclass gp2 storageclass.kubernetes.io/is-default-class=false --overwrite 2>/dev/null || true
echo "✅ Storage class configured"

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
        echo "💡 AI Insights: DISABLED"
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
