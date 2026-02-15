#!/bin/bash
set -e

# JHB StreamPulse - EKS Cluster Creation Script
# This script creates an optimized EKS cluster for JHB StreamPulse

echo "=========================================="
echo "JHB StreamPulse - EKS Cluster Creation"
echo "=========================================="
echo ""

# Configuration
CLUSTER_NAME="${EKS_CLUSTER_NAME:-jhb-streampulse-cluster}"
AWS_REGION="${AWS_REGION:-us-east-1}"
NODE_TYPE="${NODE_TYPE:-t3.medium}"
NODE_COUNT="${NODE_COUNT:-2}"
MIN_NODES="${MIN_NODES:-2}"
MAX_NODES="${MAX_NODES:-5}"

echo "Cluster Configuration:"
echo "  Name: $CLUSTER_NAME"
echo "  Region: $AWS_REGION"
echo "  Node Type: $NODE_TYPE"
echo "  Initial Nodes: $NODE_COUNT"
echo "  Min Nodes: $MIN_NODES"
echo "  Max Nodes: $MAX_NODES"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v eksctl &> /dev/null; then
    echo "❌ eksctl not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew tap weaveworks/tap
        brew install weaveworks/tap/eksctl
    else
        echo "Please install eksctl: https://eksctl.io/installation/"
        exit 1
    fi
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install: https://aws.amazon.com/cli/"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Check AWS credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured or invalid"
    echo ""
    echo "Please configure AWS credentials:"
    echo "  aws configure"
    echo ""
    echo "Or set environment variables:"
    echo "  export AWS_ACCESS_KEY_ID=your-access-key"
    echo "  export AWS_SECRET_ACCESS_KEY=your-secret-key"
    echo "  export AWS_DEFAULT_REGION=us-east-1"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ AWS Account ID: $AWS_ACCOUNT_ID"
echo ""

# Check if cluster already exists
echo "Checking if cluster already exists..."
if aws eks describe-cluster --name "$CLUSTER_NAME" --region "$AWS_REGION" &> /dev/null; then
    echo "⚠️  Cluster '$CLUSTER_NAME' already exists in region '$AWS_REGION'"
    echo ""
    read -p "Do you want to use the existing cluster? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing cluster..."
        aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$AWS_REGION"
        echo "✅ Kubeconfig updated"
        exit 0
    else
        echo "Please choose a different cluster name:"
        echo "  export EKS_CLUSTER_NAME=your-cluster-name"
        exit 1
    fi
fi

# Confirm cluster creation
echo "⚠️  This will create an EKS cluster with the following costs:"
echo "  - EKS Control Plane: ~\$73/month"
echo "  - EC2 Nodes (2x $NODE_TYPE): ~\$60/month"
echo "  - Total estimated: ~\$133/month"
echo ""
read -p "Do you want to proceed? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cluster creation cancelled"
    exit 0
fi

# Create cluster configuration file
echo ""
echo "Creating cluster configuration..."
cat > /tmp/jhb-streampulse-cluster.yaml <<EOF
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: ${CLUSTER_NAME}
  region: ${AWS_REGION}
  version: "1.31"

# Enable CloudWatch logging
cloudWatch:
  clusterLogging:
    enableTypes: ["api", "audit", "authenticator", "controllerManager", "scheduler"]

# IAM OIDC provider for service accounts
iam:
  withOIDC: true

# Managed node group
managedNodeGroups:
  - name: jhb-streampulse-nodes
    instanceType: ${NODE_TYPE}
    desiredCapacity: ${NODE_COUNT}
    minSize: ${MIN_NODES}
    maxSize: ${MAX_NODES}
    volumeSize: 20
    volumeType: gp3
    privateNetworking: false
    labels:
      role: worker
      app: jhb-streampulse
    tags:
      k8s.io/cluster-autoscaler/enabled: "true"
      k8s.io/cluster-autoscaler/${CLUSTER_NAME}: "owned"
    iam:
      withAddonPolicies:
        autoScaler: true
        ebs: true
        efs: true
        albIngress: true
        cloudWatch: true

# Add-ons
addons:
  - name: vpc-cni
    version: latest
  - name: coredns
    version: latest
  - name: kube-proxy
    version: latest
  - name: aws-ebs-csi-driver
    version: latest
    attachPolicyARNs:
      - arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy
EOF

echo "✅ Cluster configuration created"
echo ""

# Create the cluster
echo "Creating EKS cluster (this will take 15-20 minutes)..."
echo ""
eksctl create cluster -f /tmp/jhb-streampulse-cluster.yaml

# Verify cluster
echo ""
echo "Verifying cluster..."
kubectl get nodes
kubectl get pods -A

# Install AWS Load Balancer Controller
echo ""
echo "Installing AWS Load Balancer Controller..."

# Create IAM policy for ALB controller
curl -o /tmp/iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.0/docs/install/iam_policy.json

aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file:///tmp/iam_policy.json \
    --region "$AWS_REGION" 2>/dev/null || echo "Policy already exists"

# Create service account
eksctl create iamserviceaccount \
  --cluster="$CLUSTER_NAME" \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve \
  --region="$AWS_REGION" 2>/dev/null || echo "Service account already exists"

# Install ALB controller using Helm
if ! command -v helm &> /dev/null; then
    echo "Installing Helm..."
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName="$CLUSTER_NAME" \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region="$AWS_REGION" \
  --set vpcId=$(aws eks describe-cluster --name "$CLUSTER_NAME" --region "$AWS_REGION" --query "cluster.resourcesVpcConfig.vpcId" --output text) \
  2>/dev/null || echo "ALB controller already installed"

# Install Cluster Autoscaler
echo ""
echo "Installing Cluster Autoscaler..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

kubectl -n kube-system annotate deployment.apps/cluster-autoscaler \
  cluster-autoscaler.kubernetes.io/safe-to-evict="false" --overwrite

kubectl -n kube-system set image deployment.apps/cluster-autoscaler \
  cluster-autoscaler=registry.k8s.io/autoscaling/cluster-autoscaler:v1.31.0

kubectl -n kube-system patch deployment cluster-autoscaler \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"cluster-autoscaler","command":["./cluster-autoscaler","--v=4","--stderrthreshold=info","--cloud-provider=aws","--skip-nodes-with-local-storage=false","--expander=least-waste","--node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/'"$CLUSTER_NAME"'"]}]}}}}'

# Install Metrics Server
echo ""
echo "Installing Metrics Server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Create storage class for gp3
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

echo ""
echo "=========================================="
echo "EKS Cluster Created Successfully!"
echo "=========================================="
echo ""
echo "Cluster Details:"
echo "  Name: $CLUSTER_NAME"
echo "  Region: $AWS_REGION"
echo "  Endpoint: $(aws eks describe-cluster --name "$CLUSTER_NAME" --region "$AWS_REGION" --query "cluster.endpoint" --output text)"
echo ""
echo "Installed Components:"
echo "  ✅ EKS Control Plane"
echo "  ✅ Managed Node Group ($NODE_COUNT nodes)"
echo "  ✅ AWS Load Balancer Controller"
echo "  ✅ Cluster Autoscaler"
echo "  ✅ Metrics Server"
echo "  ✅ EBS CSI Driver"
echo "  ✅ gp3 Storage Class (default)"
echo ""
echo "Next Steps:"
echo "  1. Deploy JHB StreamPulse:"
echo "     cd jhb-streampulse"
echo "     export ANTHROPIC_API_KEY='your-key'"
echo "     ./deploy-to-eks.sh"
echo ""
echo "  2. Monitor cluster:"
echo "     kubectl get nodes"
echo "     kubectl get pods -A"
echo ""
echo "  3. View cluster info:"
echo "     eksctl get cluster --name $CLUSTER_NAME --region $AWS_REGION"
echo ""
echo "To delete the cluster later:"
echo "  eksctl delete cluster --name $CLUSTER_NAME --region $AWS_REGION"
echo ""
