#!/bin/bash

# AI Governance Dashboard - EKS Cluster Creation Script
# Usage: ./scripts/create-eks-cluster.sh [cluster-name] [region]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
CLUSTER_NAME=${1:-ai-governance-cluster}
REGION=${2:-us-west-2}
NODE_GROUP_NAME="ai-governance-nodes"
KUBERNETES_VERSION="1.28"
NODE_TYPE="t3.medium"
MIN_NODES=2
MAX_NODES=10
DESIRED_NODES=3

echo -e "${BLUE}🚀 Creating EKS Cluster for AI Governance Dashboard${NC}"
echo -e "${BLUE}Cluster Name: $CLUSTER_NAME${NC}"
echo -e "${BLUE}Region: $REGION${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi
    
    # Check eksctl
    if ! command -v eksctl &> /dev/null; then
        print_error "eksctl is not installed"
        echo "Install eksctl: https://eksctl.io/introduction/#installation"
        exit 1
    fi
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        exit 1
    fi
    
    print_status "Prerequisites check completed"
}

# Create EKS cluster configuration
create_cluster_config() {
    echo -e "${BLUE}📝 Creating cluster configuration...${NC}"
    
    cat > eks-cluster-config.yaml << EOF
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: $CLUSTER_NAME
  region: $REGION
  version: "$KUBERNETES_VERSION"
  tags:
    Environment: production
    Application: ai-governance-dashboard
    Team: platform

# VPC Configuration
vpc:
  enableDnsHostnames: true
  enableDnsSupport: true
  cidr: "10.0.0.0/16"
  subnets:
    public:
      public-subnet-1:
        cidr: "10.0.1.0/24"
        az: "${REGION}a"
      public-subnet-2:
        cidr: "10.0.2.0/24"
        az: "${REGION}b"
      public-subnet-3:
        cidr: "10.0.3.0/24"
        az: "${REGION}c"
    private:
      private-subnet-1:
        cidr: "10.0.11.0/24"
        az: "${REGION}a"
      private-subnet-2:
        cidr: "10.0.12.0/24"
        az: "${REGION}b"
      private-subnet-3:
        cidr: "10.0.13.0/24"
        az: "${REGION}c"

# IAM Configuration
iam:
  withOIDC: true
  serviceAccounts:
  - metadata:
      name: aws-load-balancer-controller
      namespace: kube-system
    wellKnownPolicies:
      awsLoadBalancerController: true
  - metadata:
      name: cluster-autoscaler
      namespace: kube-system
    wellKnownPolicies:
      autoScaler: true
  - metadata:
      name: ebs-csi-controller-sa
      namespace: kube-system
    wellKnownPolicies:
      ebsCSIController: true

# Managed Node Groups
managedNodeGroups:
- name: $NODE_GROUP_NAME
  instanceType: $NODE_TYPE
  minSize: $MIN_NODES
  maxSize: $MAX_NODES
  desiredCapacity: $DESIRED_NODES
  volumeSize: 50
  volumeType: gp3
  amiFamily: AmazonLinux2
  ssh:
    enableSsm: true
  labels:
    role: worker
    environment: production
  tags:
    k8s.io/cluster-autoscaler/enabled: "true"
    k8s.io/cluster-autoscaler/$CLUSTER_NAME: "owned"
  iam:
    withAddonPolicies:
      imageBuilder: true
      autoScaler: true
      externalDNS: true
      certManager: true
      appMesh: true
      appMeshPreview: true
      ebs: true
      fsx: true
      efs: true
      awsLoadBalancerController: true
      xRay: true
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
  wellKnownPolicies:
    ebsCSIController: true

# CloudWatch Logging
cloudWatch:
  clusterLogging:
    enableTypes: ["*"]
    logRetentionInDays: 30
EOF

    print_status "Cluster configuration created"
}

# Create EKS cluster
create_cluster() {
    echo -e "${BLUE}🏗️  Creating EKS cluster (this may take 15-20 minutes)...${NC}"
    
    eksctl create cluster -f eks-cluster-config.yaml
    
    print_status "EKS cluster created successfully"
}

# Configure kubectl
configure_kubectl() {
    echo -e "${BLUE}⚙️  Configuring kubectl...${NC}"
    
    aws eks update-kubeconfig --region $REGION --name $CLUSTER_NAME
    
    # Verify connection
    kubectl cluster-info
    kubectl get nodes
    
    print_status "kubectl configured successfully"
}

# Install essential add-ons
install_addons() {
    echo -e "${BLUE}🔧 Installing essential add-ons...${NC}"
    
    # Install AWS Load Balancer Controller
    echo "Installing AWS Load Balancer Controller..."
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update
    
    helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
        -n kube-system \
        --set clusterName=$CLUSTER_NAME \
        --set serviceAccount.create=false \
        --set serviceAccount.name=aws-load-balancer-controller \
        --set region=$REGION \
        --set vpcId=$(aws eks describe-cluster --name $CLUSTER_NAME --region $REGION --query "cluster.resourcesVpcConfig.vpcId" --output text)
    
    # Install Cluster Autoscaler
    echo "Installing Cluster Autoscaler..."
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
    
    kubectl patch deployment cluster-autoscaler \
        -n kube-system \
        -p '{"spec":{"template":{"metadata":{"annotations":{"cluster-autoscaler.kubernetes.io/safe-to-evict":"false"}}}}}'
    
    kubectl patch deployment cluster-autoscaler \
        -n kube-system \
        -p '{"spec":{"template":{"spec":{"containers":[{"name":"cluster-autoscaler","command":["./cluster-autoscaler","--v=4","--stderrthreshold=info","--cloud-provider=aws","--skip-nodes-with-local-storage=false","--expander=least-waste","--node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/'$CLUSTER_NAME'","--balance-similar-node-groups","--skip-nodes-with-system-pods=false"]}]}}}}'
    
    # Install Metrics Server (if not already installed)
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
    
    print_status "Essential add-ons installed"
}

# Create ECR repository
create_ecr_repository() {
    echo -e "${BLUE}🐳 Creating ECR repository...${NC}"
    
    if aws ecr describe-repositories --repository-names ai-governance-dashboard --region $REGION &> /dev/null; then
        print_status "ECR repository already exists"
    else
        aws ecr create-repository \
            --repository-name ai-governance-dashboard \
            --region $REGION \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
        
        print_status "ECR repository created"
    fi
    
    # Get repository URI
    ECR_URI=$(aws ecr describe-repositories --repository-names ai-governance-dashboard --region $REGION --query 'repositories[0].repositoryUri' --output text)
    echo -e "${GREEN}ECR Repository URI: $ECR_URI${NC}"
}

# Setup monitoring (optional)
setup_monitoring() {
    echo -e "${BLUE}📊 Setting up monitoring (optional)...${NC}"
    
    read -p "Do you want to install Prometheus and Grafana for monitoring? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Add Prometheus Helm repository
        helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
        helm repo update
        
        # Install Prometheus
        helm install prometheus prometheus-community/kube-prometheus-stack \
            --namespace monitoring \
            --create-namespace \
            --set grafana.adminPassword=admin123 \
            --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
        
        print_status "Monitoring stack installed"
        echo -e "${YELLOW}Grafana admin password: admin123${NC}"
    else
        print_warning "Skipping monitoring setup"
    fi
}

# Display cluster information
display_cluster_info() {
    echo -e "${GREEN}🎉 EKS cluster created successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Cluster Information:${NC}"
    echo -e "  Cluster Name: $CLUSTER_NAME"
    echo -e "  Region: $REGION"
    echo -e "  Kubernetes Version: $KUBERNETES_VERSION"
    echo -e "  Node Group: $NODE_GROUP_NAME"
    echo -e "  Node Type: $NODE_TYPE"
    echo -e "  Min Nodes: $MIN_NODES"
    echo -e "  Max Nodes: $MAX_NODES"
    echo -e "  Desired Nodes: $DESIRED_NODES"
    echo ""
    echo -e "${BLUE}🔧 Next Steps:${NC}"
    echo -e "  1. Deploy the application: ./scripts/deploy-eks.sh production $CLUSTER_NAME $REGION"
    echo -e "  2. Check cluster status: kubectl get nodes"
    echo -e "  3. View cluster info: kubectl cluster-info"
    echo ""
    echo -e "${BLUE}🗑️  Cleanup (when needed):${NC}"
    echo -e "  Delete cluster: eksctl delete cluster --name $CLUSTER_NAME --region $REGION"
    echo ""
    echo -e "${YELLOW}💰 Cost Optimization Tips:${NC}"
    echo -e "  - Use Spot instances for non-production workloads"
    echo -e "  - Enable cluster autoscaler to scale down unused nodes"
    echo -e "  - Monitor costs with AWS Cost Explorer"
    echo -e "  - Consider using Fargate for serverless containers"
}

# Cleanup function
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"
    rm -f eks-cluster-config.yaml
    print_status "Cleanup completed"
}

# Main cluster creation flow
main() {
    echo -e "${BLUE}🎯 Starting EKS cluster creation...${NC}"
    
    check_prerequisites
    create_cluster_config
    create_cluster
    configure_kubectl
    install_addons
    create_ecr_repository
    setup_monitoring
    display_cluster_info
    cleanup
}

# Handle script arguments
case $1 in
    "help"|"-h"|"--help")
        echo "AI Governance Dashboard - EKS Cluster Creation Script"
        echo ""
        echo "Usage: $0 [cluster-name] [region]"
        echo ""
        echo "Arguments:"
        echo "  cluster-name   EKS cluster name (default: ai-governance-cluster)"
        echo "  region         AWS region (default: us-west-2)"
        echo ""
        echo "Examples:"
        echo "  $0"
        echo "  $0 my-cluster us-east-1"
        echo ""
        echo "Prerequisites:"
        echo "  - AWS CLI configured with appropriate permissions"
        echo "  - eksctl installed"
        echo "  - kubectl installed"
        echo "  - Helm installed"
        echo ""
        echo "Required AWS Permissions:"
        echo "  - EKS full access"
        echo "  - EC2 full access"
        echo "  - IAM full access"
        echo "  - VPC full access"
        echo "  - CloudFormation full access"
        exit 0
        ;;
    *)
        main
        ;;
esac