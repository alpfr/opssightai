# AI Governance Dashboard - AWS EKS Deployment Guide

This guide provides comprehensive instructions for deploying the AI Governance Dashboard to Amazon EKS (Elastic Kubernetes Service).

## 📋 Prerequisites

### Required Tools
- **AWS CLI** v2.x - [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **eksctl** v0.150+ - [Installation Guide](https://eksctl.io/introduction/#installation)
- **kubectl** v1.28+ - [Installation Guide](https://kubernetes.io/docs/tasks/tools/)
- **Helm** v3.12+ - [Installation Guide](https://helm.sh/docs/intro/install/)
- **Docker** - [Installation Guide](https://docs.docker.com/get-docker/)

### AWS Permissions
Your AWS user/role needs the following permissions:
- EKS Full Access
- EC2 Full Access
- IAM Full Access
- VPC Full Access
- CloudFormation Full Access
- ECR Full Access

### AWS Configuration
```bash
# Configure AWS CLI
aws configure

# Verify configuration
aws sts get-caller-identity
```

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

```bash
# 1. Create EKS cluster (15-20 minutes)
./scripts/create-eks-cluster.sh

# 2. Deploy application (5-10 minutes)
./scripts/deploy-eks.sh production
```

### Option 2: Step-by-Step Deployment

Follow the detailed sections below for manual deployment.

## 🏗️ Step 1: Create EKS Cluster

### Using the Automated Script
```bash
# Create cluster with default settings
./scripts/create-eks-cluster.sh

# Create cluster with custom name and region
./scripts/create-eks-cluster.sh my-cluster us-east-1
```

### Manual Cluster Creation
```bash
# Create cluster configuration
eksctl create cluster \
  --name ai-governance-cluster \
  --region us-west-2 \
  --version 1.28 \
  --nodegroup-name ai-governance-nodes \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10 \
  --with-oidc \
  --ssh-access \
  --ssh-public-key your-key-name \
  --managed
```

### Verify Cluster
```bash
# Update kubeconfig
aws eks update-kubeconfig --region us-west-2 --name ai-governance-cluster

# Verify connection
kubectl cluster-info
kubectl get nodes
```

## 🐳 Step 2: Container Registry Setup

### Create ECR Repository
```bash
# Create repository
aws ecr create-repository \
  --repository-name ai-governance-dashboard \
  --region us-west-2 \
  --image-scanning-configuration scanOnPush=true

# Get repository URI
ECR_URI=$(aws ecr describe-repositories \
  --repository-names ai-governance-dashboard \
  --region us-west-2 \
  --query 'repositories[0].repositoryUri' \
  --output text)

echo "ECR Repository: $ECR_URI"
```

### Build and Push Image
```bash
# Build image
docker build -t ai-governance-dashboard:latest .

# Tag for ECR
docker tag ai-governance-dashboard:latest $ECR_URI:latest

# Login to ECR
aws ecr get-login-password --region us-west-2 | \
  docker login --username AWS --password-stdin $ECR_URI

# Push image
docker push $ECR_URI:latest
```

## ⚙️ Step 3: Install Required Add-ons

### AWS Load Balancer Controller
```bash
# Create IAM service account
eksctl create iamserviceaccount \
  --cluster=ai-governance-cluster \
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
  --set clusterName=ai-governance-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=us-west-2 \
  --set vpcId=$(aws eks describe-cluster --name ai-governance-cluster --region us-west-2 --query "cluster.resourcesVpcConfig.vpcId" --output text)
```

### Cluster Autoscaler (Optional)
```bash
# Install cluster autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

# Configure for your cluster
kubectl patch deployment cluster-autoscaler \
  -n kube-system \
  -p '{"spec":{"template":{"metadata":{"annotations":{"cluster-autoscaler.kubernetes.io/safe-to-evict":"false"}}}}}'
```

## 🚢 Step 4: Deploy Application

### Method 1: Using Helm (Recommended)

```bash
# Deploy with Helm
helm upgrade --install ai-governance-dashboard ./helm \
  --namespace ai-governance \
  --create-namespace \
  --set image.repository=$ECR_URI \
  --set image.tag=latest \
  --set ingress.hosts[0].host=ai-governance.yourdomain.com \
  --wait --timeout=10m
```

### Method 2: Using kubectl

```bash
# Update image in deployment manifest
sed -i "s|ai-governance-dashboard:latest|$ECR_URI:latest|g" k8s/deployment.yaml

# Apply manifests
kubectl apply -f k8s/

# Wait for deployment
kubectl rollout status deployment/ai-governance-dashboard -n ai-governance
```

### Method 3: Using Deployment Script

```bash
# Deploy with automated script
./scripts/deploy-eks.sh production ai-governance-cluster us-west-2
```

## 🔍 Step 5: Verify Deployment

### Check Resources
```bash
# Check pods
kubectl get pods -n ai-governance

# Check services
kubectl get services -n ai-governance

# Check ingress
kubectl get ingress -n ai-governance

# Check HPA
kubectl get hpa -n ai-governance
```

### Get Application URL
```bash
# Get load balancer URL
kubectl get ingress -n ai-governance ai-governance-dashboard \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Health Check
```bash
# Port forward for testing
kubectl port-forward -n ai-governance svc/ai-governance-dashboard 8080:80

# Test health endpoint
curl http://localhost:8080/health
```

## 📊 Monitoring and Logging

### Install Prometheus and Grafana (Optional)
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
# Application logs
kubectl logs -f deployment/ai-governance-dashboard -n ai-governance

# All pods logs
kubectl logs -f -l app.kubernetes.io/name=ai-governance-dashboard -n ai-governance
```

## 🔧 Configuration

### Environment-Specific Values

#### Production Values (values-production.yaml)
```yaml
replicaCount: 3

resources:
  requests:
    cpu: 200m
    memory: 256Mi
  limits:
    cpu: 1000m
    memory: 1Gi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10

ingress:
  enabled: true
  annotations:
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:region:account:certificate/cert-id
  hosts:
    - host: ai-governance.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
```

#### Staging Values (values-staging.yaml)
```yaml
replicaCount: 2

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5

ingress:
  hosts:
    - host: ai-governance-staging.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
```

### Custom Deployment
```bash
# Deploy with custom values
helm upgrade --install ai-governance-dashboard ./helm \
  --namespace ai-governance \
  --create-namespace \
  --values values-production.yaml \
  --set image.repository=$ECR_URI \
  --set image.tag=v1.0.0
```

## 🔒 Security Best Practices

### Network Policies
```bash
# Apply network policies
kubectl apply -f k8s/networkpolicy.yaml
```

### Pod Security Standards
```yaml
# Add to namespace
apiVersion: v1
kind: Namespace
metadata:
  name: ai-governance
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### RBAC Configuration
```bash
# Create service account with minimal permissions
kubectl create serviceaccount ai-governance-sa -n ai-governance

# Create role and role binding
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: ai-governance
  name: ai-governance-role
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ai-governance-binding
  namespace: ai-governance
subjects:
- kind: ServiceAccount
  name: ai-governance-sa
  namespace: ai-governance
roleRef:
  kind: Role
  name: ai-governance-role
  apiGroup: rbac.authorization.k8s.io
EOF
```

## 🔄 CI/CD Integration

### GitHub Actions Example
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
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ai-governance-dashboard
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Deploy to EKS
        run: |
          aws eks update-kubeconfig --region us-west-2 --name ai-governance-cluster
          helm upgrade --install ai-governance-dashboard ./helm \
            --namespace ai-governance \
            --create-namespace \
            --set image.repository=$ECR_REGISTRY/$ECR_REPOSITORY \
            --set image.tag=$IMAGE_TAG \
            --wait --timeout=10m
```

## 📈 Scaling and Performance

### Horizontal Pod Autoscaler
```bash
# Check HPA status
kubectl get hpa -n ai-governance

# Describe HPA for details
kubectl describe hpa ai-governance-dashboard -n ai-governance
```

### Vertical Pod Autoscaler (Optional)
```bash
# Install VPA
kubectl apply -f https://github.com/kubernetes/autoscaler/releases/latest/download/vpa-release.yaml

# Create VPA for application
kubectl apply -f - <<EOF
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: ai-governance-dashboard-vpa
  namespace: ai-governance
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-governance-dashboard
  updatePolicy:
    updateMode: "Auto"
EOF
```

## 🚨 Troubleshooting

### Common Issues

#### Pods Not Starting
```bash
# Check pod status
kubectl get pods -n ai-governance

# Describe pod for events
kubectl describe pod <pod-name> -n ai-governance

# Check logs
kubectl logs <pod-name> -n ai-governance
```

#### Image Pull Errors
```bash
# Check if ECR repository exists
aws ecr describe-repositories --repository-names ai-governance-dashboard

# Verify image exists
aws ecr list-images --repository-name ai-governance-dashboard

# Check node IAM permissions for ECR
kubectl describe node <node-name>
```

#### Load Balancer Issues
```bash
# Check ALB controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Check ingress events
kubectl describe ingress ai-governance-dashboard -n ai-governance

# Verify security groups
aws ec2 describe-security-groups --filters "Name=group-name,Values=*ai-governance*"
```

#### DNS Resolution
```bash
# Test DNS from pod
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup ai-governance-dashboard.ai-governance.svc.cluster.local

# Check CoreDNS
kubectl logs -n kube-system -l k8s-app=kube-dns
```

### Performance Issues
```bash
# Check resource usage
kubectl top pods -n ai-governance
kubectl top nodes

# Check HPA metrics
kubectl get hpa -n ai-governance -o yaml

# Check cluster autoscaler
kubectl logs -n kube-system deployment/cluster-autoscaler
```

## 💰 Cost Optimization

### Use Spot Instances
```yaml
# Add to node group configuration
managedNodeGroups:
- name: spot-nodes
  instanceTypes: ["t3.medium", "t3.large", "t3a.medium", "t3a.large"]
  spot: true
  minSize: 0
  maxSize: 10
  desiredCapacity: 2
```

### Right-sizing Resources
```bash
# Use VPA recommendations
kubectl get vpa ai-governance-dashboard-vpa -n ai-governance -o yaml

# Monitor actual usage
kubectl top pods -n ai-governance --containers
```

### Cluster Autoscaler Configuration
```bash
# Configure scale-down settings
kubectl patch deployment cluster-autoscaler -n kube-system -p '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [
          {
            "name": "cluster-autoscaler",
            "command": [
              "./cluster-autoscaler",
              "--scale-down-delay-after-add=10m",
              "--scale-down-unneeded-time=10m"
            ]
          }
        ]
      }
    }
  }
}'
```

## 🗑️ Cleanup

### Delete Application
```bash
# Using Helm
helm uninstall ai-governance-dashboard -n ai-governance

# Using kubectl
kubectl delete -f k8s/
kubectl delete namespace ai-governance
```

### Delete Cluster
```bash
# Delete EKS cluster
eksctl delete cluster --name ai-governance-cluster --region us-west-2

# Delete ECR repository
aws ecr delete-repository --repository-name ai-governance-dashboard --force --region us-west-2
```

## 📚 Additional Resources

- [EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [eksctl Documentation](https://eksctl.io/)

## 🆘 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review EKS cluster logs in CloudWatch
3. Check AWS Load Balancer Controller logs
4. Verify IAM permissions and security groups
5. Open an issue with deployment details and logs

---

**Happy Deploying to EKS! 🚀**