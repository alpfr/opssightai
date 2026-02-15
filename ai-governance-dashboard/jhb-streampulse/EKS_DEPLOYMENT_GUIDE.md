# JHB StreamPulse - AWS EKS Deployment Guide

Complete guide for deploying JHB StreamPulse v2.1 with AI capabilities to Amazon EKS.

## Prerequisites

### Required Tools
- **AWS CLI** - [Install Guide](https://aws.amazon.com/cli/)
- **kubectl** - [Install Guide](https://kubernetes.io/docs/tasks/tools/)
- **Docker** - [Install Guide](https://docs.docker.com/get-docker/)
- **eksctl** (optional, for cluster creation) - [Install Guide](https://eksctl.io/)

### AWS Requirements
- AWS Account with appropriate permissions
- IAM permissions for:
  - EKS cluster management
  - ECR repository management
  - EC2 (for worker nodes)
  - VPC and networking
  - IAM roles and policies

## Quick Start

### 1. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and default region
```

### 2. Set Environment Variables
```bash
export EKS_CLUSTER_NAME="jhb-cluster"
export AWS_REGION="us-east-1"
export ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
```

### 3. Run Deployment Script
```bash
cd jhb-streampulse
./deploy-to-eks.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Verify/create ECR repository
- ✅ Build and push Docker image to ECR
- ✅ Create Kubernetes namespace
- ✅ Deploy all resources
- ✅ Provision Network Load Balancer
- ✅ Display access URL

## Manual Deployment

If you prefer manual deployment or need more control:

### Step 1: Create EKS Cluster (if needed)
```bash
eksctl create cluster \
  --name jhb-cluster \
  --region us-east-1 \
  --nodes 2 \
  --node-type t3.medium \
  --managed
```

### Step 2: Update kubeconfig
```bash
aws eks update-kubeconfig --name jhb-cluster --region us-east-1
```

### Step 3: Create ECR Repository
```bash
aws ecr create-repository \
  --repository-name jhb-streampulse \
  --region us-east-1
```

### Step 4: Build and Push Image
```bash
# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t jhb-streampulse:v2.1.0 .

# Tag for ECR
docker tag jhb-streampulse:v2.1.0 \
  $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse:v2.1.0

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse:v2.1.0
```

### Step 5: Update Deployment Manifest
Edit `eks/deployment.yaml` and replace the image URL:
```yaml
image: YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse:v2.1.0
```

### Step 6: Create Secret
```bash
kubectl create secret generic jhb-streampulse-ai-secret \
  --from-literal=ANTHROPIC_API_KEY='your-api-key-here' \
  -n jhb-streampulse
```

### Step 7: Deploy to EKS
```bash
kubectl apply -f eks/namespace.yaml
kubectl apply -f eks/service-account.yaml
kubectl apply -f eks/configmap.yaml
kubectl apply -f eks/pvc.yaml
kubectl apply -f eks/deployment.yaml
kubectl apply -f eks/service.yaml
kubectl apply -f eks/hpa.yaml
kubectl apply -f eks/pdb.yaml
```

### Step 8: Get LoadBalancer URL
```bash
kubectl get svc jhb-streampulse -n jhb-streampulse
```

Wait for the `EXTERNAL-IP` column to show the NLB hostname (may take 2-3 minutes).

## Architecture

### AWS Resources Created
- **EKS Cluster**: Managed Kubernetes cluster
- **ECR Repository**: Private Docker image registry
- **Network Load Balancer**: Layer 4 load balancer for external access
- **EBS Volumes**: gp3 persistent storage for SQLite database
- **EC2 Worker Nodes**: Compute instances for running pods

### Kubernetes Resources
- **Namespace**: `jhb-streampulse`
- **Deployment**: 2 replicas with rolling updates
- **Service**: LoadBalancer type with NLB
- **HPA**: Auto-scaling 2-5 pods based on CPU/memory
- **PVC**: 5Gi gp3 volume for database
- **PDB**: Ensures 1 pod always available
- **ConfigMap**: Environment configuration
- **Secret**: Anthropic API key

## Configuration

### Environment Variables (ConfigMap)
```yaml
NODE_ENV: "production"
PORT: "8000"
ADMIN_PIN: "1234"  # Change this!
```

### Storage Class
Uses AWS EBS gp3 volumes (faster and cheaper than gp2):
```yaml
storageClassName: gp3
```

### Load Balancer
Network Load Balancer (NLB) with:
- Cross-zone load balancing enabled
- Session affinity (3-hour timeout)
- Health checks on `/api/stats`

## Scaling

### Horizontal Pod Autoscaler
Automatically scales between 2-5 pods based on:
- CPU utilization > 70%
- Memory utilization > 80%

### Manual Scaling
```bash
kubectl scale deployment jhb-streampulse -n jhb-streampulse --replicas=3
```

## Monitoring

### View Logs
```bash
# All pods
kubectl logs -n jhb-streampulse -l app=jhb-streampulse -f

# Specific pod
kubectl logs -n jhb-streampulse <pod-name> -f
```

### Check Pod Status
```bash
kubectl get pods -n jhb-streampulse
kubectl describe pod <pod-name> -n jhb-streampulse
```

### Check Service
```bash
kubectl get svc jhb-streampulse -n jhb-streampulse
kubectl describe svc jhb-streampulse -n jhb-streampulse
```

### Check HPA
```bash
kubectl get hpa -n jhb-streampulse
kubectl describe hpa jhb-streampulse-hpa -n jhb-streampulse
```

## Updating

### Update Image
```bash
# Build and push new image
docker build -t jhb-streampulse:v2.2.0 .
docker tag jhb-streampulse:v2.2.0 \
  $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse:v2.2.0
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse:v2.2.0

# Update deployment
kubectl set image deployment/jhb-streampulse \
  jhb-streampulse=$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse:v2.2.0 \
  -n jhb-streampulse

# Watch rollout
kubectl rollout status deployment/jhb-streampulse -n jhb-streampulse
```

### Update API Key
```bash
kubectl create secret generic jhb-streampulse-ai-secret \
  --from-literal=ANTHROPIC_API_KEY='new-key' \
  -n jhb-streampulse \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl rollout restart deployment/jhb-streampulse -n jhb-streampulse
```

### Update Configuration
```bash
kubectl edit configmap jhb-streampulse-config -n jhb-streampulse
kubectl rollout restart deployment/jhb-streampulse -n jhb-streampulse
```

## Cost Optimization

### Estimated Monthly Costs (us-east-1)
- **EKS Cluster**: $73/month (control plane)
- **EC2 Instances**: ~$30/month (2x t3.medium spot instances)
- **EBS Storage**: ~$0.40/month (5Gi gp3)
- **Network Load Balancer**: ~$16/month
- **Data Transfer**: Variable
- **ECR Storage**: ~$0.10/month
- **Total**: ~$120-130/month

### Cost Reduction Tips
1. **Use Spot Instances**: Save up to 70% on EC2 costs
2. **Right-size Nodes**: Use t3.small if traffic is low
3. **Use Fargate**: Serverless option (pay per pod)
4. **Enable Cluster Autoscaler**: Scale nodes based on demand
5. **Use gp3 volumes**: 20% cheaper than gp2

## Security Best Practices

### 1. Use AWS Secrets Manager
Instead of Kubernetes secrets, use AWS Secrets Manager:
```bash
# Store secret in AWS Secrets Manager
aws secretsmanager create-secret \
  --name jhb-streampulse/anthropic-key \
  --secret-string "your-api-key"

# Use External Secrets Operator or AWS Secrets CSI Driver
```

### 2. Enable IRSA (IAM Roles for Service Accounts)
```bash
eksctl create iamserviceaccount \
  --name jhb-streampulse \
  --namespace jhb-streampulse \
  --cluster jhb-cluster \
  --attach-policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite \
  --approve
```

### 3. Enable Pod Security Standards
```bash
kubectl label namespace jhb-streampulse \
  pod-security.kubernetes.io/enforce=restricted
```

### 4. Use Network Policies
Enable Calico or AWS VPC CNI network policies to restrict pod-to-pod communication.

### 5. Enable Encryption
- EBS volumes: Enable encryption at rest
- Secrets: Use AWS KMS for encryption
- Transit: Use TLS/SSL (see SSL setup below)

## SSL/TLS Setup

### Option 1: AWS Certificate Manager + ALB
```bash
# Create certificate in ACM
aws acm request-certificate \
  --domain-name streampulse.yourdomain.com \
  --validation-method DNS

# Change service type to NodePort
# Deploy ALB Ingress Controller
# Create Ingress with ACM certificate annotation
```

### Option 2: cert-manager + Let's Encrypt
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer and Certificate resources
```

## Backup and Disaster Recovery

### Backup Database
```bash
# Copy database from pod
kubectl cp jhb-streampulse/<pod-name>:/app/data/streampulse.db \
  ./backup-$(date +%Y%m%d).db \
  -n jhb-streampulse
```

### Automated Backups
Use AWS Backup or create a CronJob:
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: jhb-streampulse-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: amazon/aws-cli
            command:
            - /bin/sh
            - -c
            - aws s3 cp /data/streampulse.db s3://your-backup-bucket/$(date +%Y%m%d).db
            volumeMounts:
            - name: data
              mountPath: /data
          volumes:
          - name: data
            persistentVolumeClaim:
              claimName: jhb-streampulse-data
```

## Troubleshooting

### Pods Not Starting
```bash
kubectl describe pod <pod-name> -n jhb-streampulse
kubectl logs <pod-name> -n jhb-streampulse
```

### LoadBalancer Not Provisioning
```bash
# Check service events
kubectl describe svc jhb-streampulse -n jhb-streampulse

# Verify AWS Load Balancer Controller is installed
kubectl get deployment -n kube-system aws-load-balancer-controller
```

### Image Pull Errors
```bash
# Verify ECR permissions
aws ecr get-login-password --region us-east-1

# Check if image exists
aws ecr describe-images --repository-name jhb-streampulse --region us-east-1
```

### Database Issues
```bash
# Check PVC status
kubectl get pvc -n jhb-streampulse

# Check volume mount
kubectl exec -it <pod-name> -n jhb-streampulse -- ls -la /app/data
```

## Cleanup

### Delete Application
```bash
kubectl delete namespace jhb-streampulse
```

### Delete ECR Repository
```bash
aws ecr delete-repository \
  --repository-name jhb-streampulse \
  --region us-east-1 \
  --force
```

### Delete EKS Cluster
```bash
eksctl delete cluster --name jhb-cluster --region us-east-1
```

## Support

For issues or questions:
1. Check logs: `kubectl logs -n jhb-streampulse -l app=jhb-streampulse`
2. Check events: `kubectl get events -n jhb-streampulse`
3. Verify resources: `kubectl get all -n jhb-streampulse`

## Next Steps

1. **Set up DNS**: Point your domain to the NLB hostname
2. **Enable SSL**: Use ACM + ALB or cert-manager
3. **Configure monitoring**: Set up CloudWatch or Prometheus
4. **Enable backups**: Automate database backups to S3
5. **Set up CI/CD**: Automate deployments with GitHub Actions or CodePipeline
