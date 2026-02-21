# OpsSightAI - AWS EKS Implementation Plan

## Executive Summary

This document outlines the complete implementation plan for deploying OpsSightAI to AWS EKS (Elastic Kubernetes Service). The deployment will include the frontend, backend API, TimescaleDB, Redis, and RabbitMQ with production-grade configurations for high availability, scalability, and security.

## 🎯 Deployment Goals

- **High Availability**: Multi-AZ deployment with auto-scaling
- **Security**: Network isolation, encryption, and IAM best practices
- **Performance**: Optimized resource allocation and caching
- **Cost Efficiency**: Right-sized instances with spot instances where appropriate
- **Monitoring**: Comprehensive observability with CloudWatch and Prometheus
- **Disaster Recovery**: Automated backups and recovery procedures

## 📋 Prerequisites

### Required AWS Services
- **EKS**: Kubernetes cluster management
- **ECR**: Container registry for Docker images
- **RDS**: Managed TimescaleDB (PostgreSQL with TimescaleDB extension)
- **ElastiCache**: Managed Redis cluster
- **Amazon MQ**: Managed RabbitMQ
- **ALB**: Application Load Balancer for ingress
- **Route53**: DNS management
- **ACM**: SSL/TLS certificates
- **CloudWatch**: Logging and monitoring
- **S3**: Backup storage

### Required Tools
- AWS CLI v2.x
- eksctl v0.150+
- kubectl v1.28+
- Helm v3.12+
- Docker
- terraform (optional, for IaC)

### Estimated Costs (Monthly)
- EKS Cluster: $73
- EC2 Nodes (3x t3.medium): ~$90
- RDS (db.t3.medium): ~$60
- ElastiCache (cache.t3.micro): ~$15
- Amazon MQ (mq.t3.micro): ~$18
- ALB: ~$20
- Data Transfer: ~$20
- **Total**: ~$296/month (development)
- **Production**: ~$800-1200/month (with larger instances and HA)


## 🗺️ Implementation Phases

### Phase 1: Infrastructure Setup (Week 1)
1. AWS account configuration and IAM setup
2. VPC and networking configuration
3. EKS cluster creation
4. RDS TimescaleDB setup
5. ElastiCache Redis setup
6. Amazon MQ RabbitMQ setup

### Phase 2: Container Preparation (Week 1-2)
1. Dockerize backend application
2. Dockerize frontend application
3. Create ECR repositories
4. Build and push images
5. Image scanning and security

### Phase 3: Kubernetes Deployment (Week 2)
1. Create Kubernetes manifests
2. Configure Helm charts
3. Deploy backend services
4. Deploy frontend application
5. Configure ingress and load balancer

### Phase 4: Configuration & Security (Week 2-3)
1. Secrets management with AWS Secrets Manager
2. IAM roles and service accounts
3. Network policies
4. SSL/TLS configuration
5. Security group configuration

### Phase 5: Monitoring & Logging (Week 3)
1. CloudWatch integration
2. Prometheus and Grafana setup
3. Application Performance Monitoring
4. Log aggregation
5. Alerting configuration

### Phase 6: Testing & Optimization (Week 3-4)
1. Load testing
2. Performance optimization
3. Cost optimization
4. Disaster recovery testing
5. Documentation

### Phase 7: Production Cutover (Week 4)
1. Final security audit
2. Backup verification
3. DNS cutover
4. Production deployment
5. Post-deployment monitoring


## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Route 53 (DNS)                           │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                           │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │          Application Load Balancer (ALB)                    │ │
│  │              + ACM SSL Certificate                          │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                           │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │                    EKS Cluster                              │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │   Frontend   │  │   Backend    │  │   Backend    │    │ │
│  │  │   Pod (x3)   │  │   Pod (x3)   │  │   Pod (x3)   │    │ │
│  │  │  React/Nginx │  │  Node.js/TS  │  │  Node.js/TS  │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │ │
│  │         │                  │                  │             │ │
│  │         └──────────────────┼──────────────────┘             │ │
│  │                            │                                │ │
│  └────────────────────────────┼────────────────────────────────┘ │
│                               │                                   │
│  ┌────────────────────────────┼────────────────────────────────┐ │
│  │                            │                                 │ │
│  │  ┌─────────────────────────▼──────────┐                    │ │
│  │  │      RDS TimescaleDB               │                    │ │
│  │  │   (Multi-AZ, Automated Backups)    │                    │ │
│  │  └────────────────────────────────────┘                    │ │
│  │                                                             │ │
│  │  ┌────────────────────────────────────┐                    │ │
│  │  │      ElastiCache Redis             │                    │ │
│  │  │   (Cluster Mode, Multi-AZ)         │                    │ │
│  │  └────────────────────────────────────┘                    │ │
│  │                                                             │ │
│  │  ┌────────────────────────────────────┐                    │ │
│  │  │      Amazon MQ (RabbitMQ)          │                    │ │
│  │  │   (Active/Standby)                 │                    │ │
│  │  └────────────────────────────────────┘                    │ │
│  │                                                             │ │
│  │                  Managed Services                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  CloudWatch Logs + Metrics + Alarms                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  S3 (Backups + Static Assets)                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```


## 🔧 Phase 1: Infrastructure Setup

### 1.1 AWS Account Configuration

```bash
# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-west-2), Output format (json)

# Verify configuration
aws sts get-caller-identity

# Set environment variables
export AWS_REGION=us-west-2
export CLUSTER_NAME=opssightai-prod
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
```

### 1.2 Create VPC and Networking

```bash
# Create VPC with eksctl (recommended)
eksctl create cluster --name $CLUSTER_NAME \
  --region $AWS_REGION \
  --version 1.28 \
  --vpc-cidr 10.0.0.0/16 \
  --without-nodegroup \
  --dry-run

# Or use existing VPC
export VPC_ID=vpc-xxxxx
export SUBNET_IDS=subnet-xxxxx,subnet-yyyyy,subnet-zzzzz
```

### 1.3 Create EKS Cluster

**Option A: Using eksctl (Recommended)**

```bash
# Create cluster configuration file
cat > opssightai-cluster.yaml <<EOF
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: ${CLUSTER_NAME}
  region: ${AWS_REGION}
  version: "1.28"

vpc:
  cidr: 10.0.0.0/16
  nat:
    gateway: HighlyAvailable

iam:
  withOIDC: true

managedNodeGroups:
  - name: opssightai-nodes
    instanceType: t3.medium
    minSize: 3
    maxSize: 10
    desiredCapacity: 3
    volumeSize: 50
    privateNetworking: true
    labels:
      role: application
    tags:
      nodegroup-role: application
    iam:
      withAddonPolicies:
        imageBuilder: true
        autoScaler: true
        externalDNS: true
        certManager: true
        appMesh: true
        ebs: true
        fsx: true
        efs: true
        albIngress: true
        cloudWatch: true

  - name: opssightai-spot-nodes
    instanceTypes: ["t3.medium", "t3a.medium", "t3.large"]
    spot: true
    minSize: 0
    maxSize: 5
    desiredCapacity: 2
    privateNetworking: true
    labels:
      role: application
      lifecycle: spot
    taints:
      - key: spot
        value: "true"
        effect: NoSchedule

addons:
  - name: vpc-cni
  - name: coredns
  - name: kube-proxy
  - name: aws-ebs-csi-driver

cloudWatch:
  clusterLogging:
    enableTypes: ["*"]
EOF

# Create cluster (15-20 minutes)
eksctl create cluster -f opssightai-cluster.yaml

# Update kubeconfig
aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME

# Verify cluster
kubectl cluster-info
kubectl get nodes
```


### 1.4 Setup RDS TimescaleDB

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name opssightai-db-subnet \
  --db-subnet-group-description "OpsSightAI Database Subnet Group" \
  --subnet-ids subnet-xxxxx subnet-yyyyy subnet-zzzzz

# Create security group for RDS
aws ec2 create-security-group \
  --group-name opssightai-rds-sg \
  --description "Security group for OpsSightAI RDS" \
  --vpc-id $VPC_ID

# Get security group ID
RDS_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=opssightai-rds-sg" \
  --query 'SecurityGroups[0].GroupId' --output text)

# Allow PostgreSQL access from EKS nodes
EKS_SG_ID=$(aws eks describe-cluster --name $CLUSTER_NAME \
  --query 'cluster.resourcesVpcConfig.clusterSecurityGroupId' --output text)

aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG_ID \
  --protocol tcp \
  --port 5432 \
  --source-group $EKS_SG_ID

# Create RDS instance with PostgreSQL (for TimescaleDB)
aws rds create-db-instance \
  --db-instance-identifier opssightai-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password 'YourSecurePassword123!' \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --vpc-security-group-ids $RDS_SG_ID \
  --db-subnet-group-name opssightai-db-subnet \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --multi-az \
  --publicly-accessible false \
  --enable-cloudwatch-logs-exports '["postgresql"]' \
  --tags Key=Name,Value=opssightai-db Key=Environment,Value=production

# Wait for RDS to be available (10-15 minutes)
aws rds wait db-instance-available --db-instance-identifier opssightai-db

# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier opssightai-db \
  --query 'DBInstances[0].Endpoint.Address' --output text)

echo "RDS Endpoint: $RDS_ENDPOINT"

# Install TimescaleDB extension (connect via bastion or EKS pod)
kubectl run -it --rm psql --image=postgres:15 --restart=Never -- \
  psql -h $RDS_ENDPOINT -U postgres -d postgres -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

### 1.5 Setup ElastiCache Redis

```bash
# Create cache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name opssightai-redis-subnet \
  --cache-subnet-group-description "OpsSightAI Redis Subnet Group" \
  --subnet-ids subnet-xxxxx subnet-yyyyy

# Create security group for Redis
aws ec2 create-security-group \
  --group-name opssightai-redis-sg \
  --description "Security group for OpsSightAI Redis" \
  --vpc-id $VPC_ID

REDIS_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=opssightai-redis-sg" \
  --query 'SecurityGroups[0].GroupId' --output text)

# Allow Redis access from EKS
aws ec2 authorize-security-group-ingress \
  --group-id $REDIS_SG_ID \
  --protocol tcp \
  --port 6379 \
  --source-group $EKS_SG_ID

# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id opssightai-redis \
  --replication-group-description "OpsSightAI Redis Cluster" \
  --engine redis \
  --engine-version 7.0 \
  --cache-node-type cache.t3.micro \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --multi-az-enabled \
  --cache-subnet-group-name opssightai-redis-subnet \
  --security-group-ids $REDIS_SG_ID \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled \
  --auth-token "YourRedisAuthToken123!" \
  --snapshot-retention-limit 5 \
  --snapshot-window "02:00-03:00" \
  --preferred-maintenance-window "sun:03:00-sun:04:00" \
  --tags Key=Name,Value=opssightai-redis Key=Environment,Value=production

# Wait for Redis to be available
aws elasticache wait replication-group-available \
  --replication-group-id opssightai-redis

# Get Redis endpoint
REDIS_ENDPOINT=$(aws elasticache describe-replication-groups \
  --replication-group-id opssightai-redis \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Address' --output text)

echo "Redis Endpoint: $REDIS_ENDPOINT"
```


### 1.6 Setup Amazon MQ (RabbitMQ)

```bash
# Create security group for Amazon MQ
aws ec2 create-security-group \
  --group-name opssightai-mq-sg \
  --description "Security group for OpsSightAI Amazon MQ" \
  --vpc-id $VPC_ID

MQ_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=opssightai-mq-sg" \
  --query 'SecurityGroups[0].GroupId' --output text)

# Allow RabbitMQ access from EKS
aws ec2 authorize-security-group-ingress \
  --group-id $MQ_SG_ID \
  --protocol tcp \
  --port 5671 \
  --source-group $EKS_SG_ID

aws ec2 authorize-security-group-ingress \
  --group-id $MQ_SG_ID \
  --protocol tcp \
  --port 443 \
  --source-group $EKS_SG_ID

# Create Amazon MQ broker
aws mq create-broker \
  --broker-name opssightai-mq \
  --engine-type RABBITMQ \
  --engine-version 3.11 \
  --host-instance-type mq.t3.micro \
  --deployment-mode ACTIVE_STANDBY_MULTI_AZ \
  --users Username=admin,Password=YourMQPassword123! \
  --subnet-ids subnet-xxxxx subnet-yyyyy \
  --security-groups $MQ_SG_ID \
  --publicly-accessible false \
  --auto-minor-version-upgrade true \
  --maintenance-window-start-time DayOfWeek=SUNDAY,TimeOfDay=03:00,TimeZone=UTC \
  --logs General=true \
  --tags Key=Name,Value=opssightai-mq Key=Environment,Value=production

# Wait for broker to be running (10-15 minutes)
aws mq wait broker-running --broker-id $(aws mq list-brokers \
  --query 'BrokerSummaries[?BrokerName==`opssightai-mq`].BrokerId' --output text)

# Get MQ endpoint
MQ_ENDPOINT=$(aws mq describe-broker --broker-id $(aws mq list-brokers \
  --query 'BrokerSummaries[?BrokerName==`opssightai-mq`].BrokerId' --output text) \
  --query 'BrokerInstances[0].Endpoints[0]' --output text)

echo "Amazon MQ Endpoint: $MQ_ENDPOINT"
```


## 🐳 Phase 2: Container Preparation

### 2.1 Create ECR Repositories

```bash
# Create backend repository
aws ecr create-repository \
  --repository-name opssightai/backend \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256 \
  --tags Key=Name,Value=opssightai-backend Key=Environment,Value=production

# Create frontend repository
aws ecr create-repository \
  --repository-name opssightai/frontend \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256 \
  --tags Key=Name,Value=opssightai-frontend Key=Environment,Value=production

# Get repository URIs
BACKEND_ECR_URI=$(aws ecr describe-repositories \
  --repository-names opssightai/backend \
  --query 'repositories[0].repositoryUri' --output text)

FRONTEND_ECR_URI=$(aws ecr describe-repositories \
  --repository-names opssightai/frontend \
  --query 'repositories[0].repositoryUri' --output text)

echo "Backend ECR: $BACKEND_ECR_URI"
echo "Frontend ECR: $FRONTEND_ECR_URI"
```

### 2.2 Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile.prod`):

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]
```

**Frontend Dockerfile** (`frontend/Dockerfile.prod`):

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 101 -S nginx && \
    adduser -S nginx -u 101 -G nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Configuration** (`frontend/nginx.prod.conf`):

```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json image/svg+xml;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Health endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Disable access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```


### 2.3 Build and Push Images

```bash
# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build backend image
cd backend
docker build -f Dockerfile.prod -t opssightai-backend:latest .
docker tag opssightai-backend:latest $BACKEND_ECR_URI:latest
docker tag opssightai-backend:latest $BACKEND_ECR_URI:v1.0.0
docker push $BACKEND_ECR_URI:latest
docker push $BACKEND_ECR_URI:v1.0.0

# Build frontend image
cd ../frontend
docker build -f Dockerfile.prod -t opssightai-frontend:latest .
docker tag opssightai-frontend:latest $FRONTEND_ECR_URI:latest
docker tag opssightai-frontend:latest $FRONTEND_ECR_URI:v1.0.0
docker push $FRONTEND_ECR_URI:latest
docker push $FRONTEND_ECR_URI:v1.0.0

# Verify images
aws ecr list-images --repository-name opssightai/backend
aws ecr list-images --repository-name opssightai/frontend

# Scan images for vulnerabilities
aws ecr start-image-scan --repository-name opssightai/backend --image-id imageTag=latest
aws ecr start-image-scan --repository-name opssightai/frontend --image-id imageTag=latest

# Check scan results
aws ecr describe-image-scan-findings --repository-name opssightai/backend --image-id imageTag=latest
aws ecr describe-image-scan-findings --repository-name opssightai/frontend --image-id imageTag=latest
```

### 2.4 Create Build Script

Create `scripts/build-and-push.sh`:

```bash
#!/bin/bash
set -e

# Configuration
AWS_REGION=${AWS_REGION:-us-west-2}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
VERSION=${1:-latest}

# ECR URIs
BACKEND_ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/opssightai/backend"
FRONTEND_ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/opssightai/frontend"

echo "Building and pushing OpsSightAI images..."
echo "Version: $VERSION"
echo "Region: $AWS_REGION"

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push backend
echo "Building backend..."
cd backend
docker build -f Dockerfile.prod -t opssightai-backend:$VERSION .
docker tag opssightai-backend:$VERSION $BACKEND_ECR_URI:$VERSION
docker tag opssightai-backend:$VERSION $BACKEND_ECR_URI:latest
docker push $BACKEND_ECR_URI:$VERSION
docker push $BACKEND_ECR_URI:latest
echo "Backend pushed successfully!"

# Build and push frontend
echo "Building frontend..."
cd ../frontend
docker build -f Dockerfile.prod -t opssightai-frontend:$VERSION .
docker tag opssightai-frontend:$VERSION $FRONTEND_ECR_URI:$VERSION
docker tag opssightai-frontend:$VERSION $FRONTEND_ECR_URI:latest
docker push $FRONTEND_ECR_URI:$VERSION
docker push $FRONTEND_ECR_URI:latest
echo "Frontend pushed successfully!"

echo "All images built and pushed successfully!"
echo "Backend: $BACKEND_ECR_URI:$VERSION"
echo "Frontend: $FRONTEND_ECR_URI:$VERSION"
```

Make it executable:
```bash
chmod +x scripts/build-and-push.sh
```


## ☸️ Phase 3: Kubernetes Deployment

### 3.1 Install AWS Load Balancer Controller

```bash
# Create IAM policy
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.6.0/docs/install/iam_policy.json

aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json

# Create IAM service account
eksctl create iamserviceaccount \
  --cluster=$CLUSTER_NAME \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::$AWS_ACCOUNT_ID:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve

# Add Helm repository
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=$CLUSTER_NAME \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=$AWS_REGION \
  --set vpcId=$(aws eks describe-cluster --name $CLUSTER_NAME --region $AWS_REGION --query "cluster.resourcesVpcConfig.vpcId" --output text)

# Verify installation
kubectl get deployment -n kube-system aws-load-balancer-controller
```

### 3.2 Create Kubernetes Namespace and Secrets

```bash
# Create namespace
kubectl create namespace opssightai

# Create secrets from AWS Secrets Manager (recommended)
# First, store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name opssightai/database \
  --secret-string "{\"host\":\"$RDS_ENDPOINT\",\"port\":\"5432\",\"database\":\"opssight\",\"username\":\"postgres\",\"password\":\"YourSecurePassword123!\"}"

aws secretsmanager create-secret \
  --name opssightai/redis \
  --secret-string "{\"host\":\"$REDIS_ENDPOINT\",\"port\":\"6379\",\"password\":\"YourRedisAuthToken123!\"}"

aws secretsmanager create-secret \
  --name opssightai/rabbitmq \
  --secret-string "{\"url\":\"$MQ_ENDPOINT\",\"username\":\"admin\",\"password\":\"YourMQPassword123!\"}"

# Install AWS Secrets Manager CSI Driver
helm repo add secrets-store-csi-driver https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts
helm install csi-secrets-store secrets-store-csi-driver/secrets-store-csi-driver --namespace kube-system

# Install AWS provider
kubectl apply -f https://raw.githubusercontent.com/aws/secrets-store-csi-driver-provider-aws/main/deployment/aws-provider-installer.yaml

# Create IAM policy for secrets access
cat > secrets-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:$AWS_REGION:$AWS_ACCOUNT_ID:secret:opssightai/*"
      ]
    }
  ]
}
EOF

aws iam create-policy \
  --policy-name OpsSightAISecretsPolicy \
  --policy-document file://secrets-policy.json

# Create service account with IAM role
eksctl create iamserviceaccount \
  --name opssightai-sa \
  --namespace opssightai \
  --cluster $CLUSTER_NAME \
  --attach-policy-arn arn:aws:iam::$AWS_ACCOUNT_ID:policy/OpsSightAISecretsPolicy \
  --approve \
  --override-existing-serviceaccounts
```


### 3.3 Create Kubernetes Manifests

Create `k8s/opssightai/` directory with the following files:

**ConfigMap** (`k8s/opssightai/configmap.yaml`):

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: opssightai-config
  namespace: opssightai
data:
  NODE_ENV: "production"
  PORT: "4000"
  LOG_LEVEL: "info"
  VITE_API_URL: "https://api.opssightai.yourdomain.com"
```

**SecretProviderClass** (`k8s/opssightai/secret-provider.yaml`):

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: opssightai-secrets
  namespace: opssightai
spec:
  provider: aws
  parameters:
    objects: |
      - objectName: "opssightai/database"
        objectType: "secretsmanager"
        jmesPath:
          - path: host
            objectAlias: db_host
          - path: port
            objectAlias: db_port
          - path: database
            objectAlias: db_name
          - path: username
            objectAlias: db_user
          - path: password
            objectAlias: db_password
      - objectName: "opssightai/redis"
        objectType: "secretsmanager"
        jmesPath:
          - path: host
            objectAlias: redis_host
          - path: port
            objectAlias: redis_port
          - path: password
            objectAlias: redis_password
      - objectName: "opssightai/rabbitmq"
        objectType: "secretsmanager"
        jmesPath:
          - path: url
            objectAlias: rabbitmq_url
          - path: username
            objectAlias: rabbitmq_user
          - path: password
            objectAlias: rabbitmq_password
  secretObjects:
    - secretName: opssightai-db-secret
      type: Opaque
      data:
        - objectName: db_host
          key: DATABASE_HOST
        - objectName: db_port
          key: DATABASE_PORT
        - objectName: db_name
          key: DATABASE_NAME
        - objectName: db_user
          key: DATABASE_USER
        - objectName: db_password
          key: DATABASE_PASSWORD
    - secretName: opssightai-redis-secret
      type: Opaque
      data:
        - objectName: redis_host
          key: REDIS_HOST
        - objectName: redis_port
          key: REDIS_PORT
        - objectName: redis_password
          key: REDIS_PASSWORD
    - secretName: opssightai-rabbitmq-secret
      type: Opaque
      data:
        - objectName: rabbitmq_url
          key: RABBITMQ_URL
        - objectName: rabbitmq_user
          key: RABBITMQ_USER
        - objectName: rabbitmq_password
          key: RABBITMQ_PASSWORD
```

**Backend Deployment** (`k8s/opssightai/backend-deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: opssightai-backend
  namespace: opssightai
  labels:
    app: opssightai
    component: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: opssightai
      component: backend
  template:
    metadata:
      labels:
        app: opssightai
        component: backend
    spec:
      serviceAccountName: opssightai-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: backend
        image: ${BACKEND_ECR_URI}:latest
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 4000
          protocol: TCP
        envFrom:
        - configMapRef:
            name: opssightai-config
        - secretRef:
            name: opssightai-db-secret
        - secretRef:
            name: opssightai-redis-secret
        - secretRef:
            name: opssightai-rabbitmq-secret
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        livenessProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: secrets-store
          mountPath: "/mnt/secrets-store"
          readOnly: true
      volumes:
      - name: secrets-store
        csi:
          driver: secrets-store.csi.k8s.io
          readOnly: true
          volumeAttributes:
            secretProviderClass: "opssightai-secrets"
```

**Backend Service** (`k8s/opssightai/backend-service.yaml`):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: opssightai-backend
  namespace: opssightai
  labels:
    app: opssightai
    component: backend
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: opssightai
    component: backend
```


**Frontend Deployment** (`k8s/opssightai/frontend-deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: opssightai-frontend
  namespace: opssightai
  labels:
    app: opssightai
    component: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: opssightai
      component: frontend
  template:
    metadata:
      labels:
        app: opssightai
        component: frontend
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 101
        fsGroup: 101
      containers:
      - name: frontend
        image: ${FRONTEND_ECR_URI}:latest
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
```

**Frontend Service** (`k8s/opssightai/frontend-service.yaml`):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: opssightai-frontend
  namespace: opssightai
  labels:
    app: opssightai
    component: frontend
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: opssightai
    component: frontend
```

**Ingress** (`k8s/opssightai/ingress.yaml`):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: opssightai-ingress
  namespace: opssightai
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:${AWS_REGION}:${AWS_ACCOUNT_ID}:certificate/YOUR-CERT-ID
    alb.ingress.kubernetes.io/security-groups: sg-xxxxx
    alb.ingress.kubernetes.io/tags: Environment=production,Application=opssightai
spec:
  rules:
  - host: opssightai.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: opssightai-backend
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: opssightai-frontend
            port:
              number: 80
```

**HorizontalPodAutoscaler** (`k8s/opssightai/hpa.yaml`):

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: opssightai-backend-hpa
  namespace: opssightai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: opssightai-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: opssightai-frontend-hpa
  namespace: opssightai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: opssightai-frontend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**PodDisruptionBudget** (`k8s/opssightai/pdb.yaml`):

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: opssightai-backend-pdb
  namespace: opssightai
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: opssightai
      component: backend
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: opssightai-frontend-pdb
  namespace: opssightai
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: opssightai
      component: frontend
```


### 3.4 Deploy Application

```bash
# Replace placeholders in manifests
export BACKEND_ECR_URI=$(aws ecr describe-repositories --repository-names opssightai/backend --query 'repositories[0].repositoryUri' --output text)
export FRONTEND_ECR_URI=$(aws ecr describe-repositories --repository-names opssightai/frontend --query 'repositories[0].repositoryUri' --output text)

# Update manifests with actual values
find k8s/opssightai -type f -name "*.yaml" -exec sed -i '' "s|\${BACKEND_ECR_URI}|$BACKEND_ECR_URI|g" {} \;
find k8s/opssightai -type f -name "*.yaml" -exec sed -i '' "s|\${FRONTEND_ECR_URI}|$FRONTEND_ECR_URI|g" {} \;
find k8s/opssightai -type f -name "*.yaml" -exec sed -i '' "s|\${AWS_REGION}|$AWS_REGION|g" {} \;
find k8s/opssightai -type f -name "*.yaml" -exec sed -i '' "s|\${AWS_ACCOUNT_ID}|$AWS_ACCOUNT_ID|g" {} \;

# Apply manifests
kubectl apply -f k8s/opssightai/

# Wait for deployments
kubectl rollout status deployment/opssightai-backend -n opssightai
kubectl rollout status deployment/opssightai-frontend -n opssightai

# Verify pods
kubectl get pods -n opssightai

# Check services
kubectl get svc -n opssightai

# Check ingress
kubectl get ingress -n opssightai

# Get ALB URL
kubectl get ingress opssightai-ingress -n opssightai -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### 3.5 Initialize Database

```bash
# Port forward to backend pod
kubectl port-forward -n opssightai deployment/opssightai-backend 4000:4000 &

# Run database initialization script
kubectl exec -it -n opssightai deployment/opssightai-backend -- node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD
});

async function init() {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS timescaledb;');
    console.log('TimescaleDB extension created');
    
    // Run your init-db.sql script here
    // Or use kubectl cp to copy the script and execute it
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

init();
"

# Or copy and execute init script
kubectl cp docker/init-db.sql opssightai/$(kubectl get pod -n opssightai -l component=backend -o jsonpath='{.items[0].metadata.name}'):/tmp/init-db.sql
kubectl exec -it -n opssightai deployment/opssightai-backend -- psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -f /tmp/init-db.sql
```


## 🔒 Phase 4: Security & Configuration

### 4.1 Setup SSL/TLS Certificate

```bash
# Request certificate from ACM
aws acm request-certificate \
  --domain-name opssightai.yourdomain.com \
  --subject-alternative-names "*.opssightai.yourdomain.com" \
  --validation-method DNS \
  --region $AWS_REGION

# Get certificate ARN
CERT_ARN=$(aws acm list-certificates --region $AWS_REGION \
  --query 'CertificateSummaryList[?DomainName==`opssightai.yourdomain.com`].CertificateArn' \
  --output text)

echo "Certificate ARN: $CERT_ARN"

# Get DNS validation records
aws acm describe-certificate --certificate-arn $CERT_ARN --region $AWS_REGION \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord'

# Add DNS validation record to Route53 (or your DNS provider)
# Wait for certificate to be issued
aws acm wait certificate-validated --certificate-arn $CERT_ARN --region $AWS_REGION

# Update ingress with certificate ARN
kubectl patch ingress opssightai-ingress -n opssightai -p \
  "{\"metadata\":{\"annotations\":{\"alb.ingress.kubernetes.io/certificate-arn\":\"$CERT_ARN\"}}}"
```

### 4.2 Configure Route53 DNS

```bash
# Get ALB DNS name
ALB_DNS=$(kubectl get ingress opssightai-ingress -n opssightai \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Get hosted zone ID
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name yourdomain.com \
  --query 'HostedZones[0].Id' --output text | cut -d'/' -f3)

# Create Route53 record
cat > route53-record.json <<EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "opssightai.yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "$(aws elbv2 describe-load-balancers \
            --query "LoadBalancers[?DNSName=='$ALB_DNS'].CanonicalHostedZoneId" \
            --output text)",
          "DNSName": "$ALB_DNS",
          "EvaluateTargetHealth": true
        }
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://route53-record.json

# Verify DNS
dig opssightai.yourdomain.com
```

### 4.3 Network Policies

Create `k8s/opssightai/network-policy.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: opssightai-backend-policy
  namespace: opssightai
spec:
  podSelector:
    matchLabels:
      app: opssightai
      component: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: opssightai
          component: frontend
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: TCP
      port: 4000
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 5432  # PostgreSQL
    - protocol: TCP
      port: 6379  # Redis
    - protocol: TCP
      port: 5671  # RabbitMQ
    - protocol: TCP
      port: 443   # HTTPS
    - protocol: TCP
      port: 53    # DNS
    - protocol: UDP
      port: 53    # DNS
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: opssightai-frontend-policy
  namespace: opssightai
spec:
  podSelector:
    matchLabels:
      app: opssightai
      component: frontend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: opssightai
          component: backend
    ports:
    - protocol: TCP
      port: 4000
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
```

Apply network policies:
```bash
kubectl apply -f k8s/opssightai/network-policy.yaml
```

### 4.4 Pod Security Standards

```bash
# Label namespace with pod security standards
kubectl label namespace opssightai \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/audit=restricted \
  pod-security.kubernetes.io/warn=restricted
```

### 4.5 RBAC Configuration

Create `k8s/opssightai/rbac.yaml`:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: opssightai-sa
  namespace: opssightai
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: opssightai-role
  namespace: opssightai
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: opssightai-binding
  namespace: opssightai
subjects:
- kind: ServiceAccount
  name: opssightai-sa
  namespace: opssightai
roleRef:
  kind: Role
  name: opssightai-role
  apiGroup: rbac.authorization.k8s.io
```

Apply RBAC:
```bash
kubectl apply -f k8s/opssightai/rbac.yaml
```


## 📊 Phase 5: Monitoring & Logging

### 5.1 Install Prometheus and Grafana

```bash
# Add Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set grafana.adminPassword=admin123 \
  --set grafana.ingress.enabled=true \
  --set grafana.ingress.hosts[0]=grafana.opssightai.yourdomain.com

# Verify installation
kubectl get pods -n monitoring
```

### 5.2 Create ServiceMonitor

Create `k8s/opssightai/servicemonitor.yaml`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: opssightai-backend
  namespace: opssightai
  labels:
    app: opssightai
    component: backend
spec:
  selector:
    matchLabels:
      app: opssightai
      component: backend
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

Apply ServiceMonitor:
```bash
kubectl apply -f k8s/opssightai/servicemonitor.yaml
```

### 5.3 Configure CloudWatch Container Insights

```bash
# Install CloudWatch agent
kubectl apply -f https://raw.githubusercontent.com/aws-samples/amazon-cloudwatch-container-insights/latest/k8s-deployment-manifest-templates/deployment-mode/daemonset/container-insights-monitoring/quickstart/cwagent-fluentd-quickstart.yaml

# Verify installation
kubectl get pods -n amazon-cloudwatch
```

### 5.4 Setup CloudWatch Alarms

```bash
# Create SNS topic for alerts
aws sns create-topic --name opssightai-alerts

# Subscribe email to topic
aws sns subscribe \
  --topic-arn arn:aws:sns:$AWS_REGION:$AWS_ACCOUNT_ID:opssightai-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com

# Create CloudWatch alarms
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name opssightai-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:$AWS_REGION:$AWS_ACCOUNT_ID:opssightai-alerts

# High memory alarm
aws cloudwatch put-metric-alarm \
  --alarm-name opssightai-high-memory \
  --alarm-description "Alert when memory exceeds 80%" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:$AWS_REGION:$AWS_ACCOUNT_ID:opssightai-alerts

# RDS CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name opssightai-rds-high-cpu \
  --alarm-description "Alert when RDS CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=DBInstanceIdentifier,Value=opssightai-db \
  --alarm-actions arn:aws:sns:$AWS_REGION:$AWS_ACCOUNT_ID:opssightai-alerts
```

### 5.5 Configure Log Aggregation

```bash
# Create CloudWatch log group
aws logs create-log-group --log-group-name /aws/eks/opssightai/application

# Set retention policy
aws logs put-retention-policy \
  --log-group-name /aws/eks/opssightai/application \
  --retention-in-days 30

# View logs
aws logs tail /aws/eks/opssightai/application --follow
```


## 🧪 Phase 6: Testing & Optimization

### 6.1 Load Testing

```bash
# Install k6 for load testing
brew install k6  # macOS
# or download from https://k6.io/

# Create load test script
cat > load-test.js <<'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate should be less than 1%
  },
};

export default function () {
  // Test health endpoint
  let healthRes = http.get('https://opssightai.yourdomain.com/api/health');
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  // Test assets endpoint
  let assetsRes = http.get('https://opssightai.yourdomain.com/api/assets');
  check(assetsRes, {
    'assets status is 200': (r) => r.status === 200,
    'assets response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
EOF

# Run load test
k6 run load-test.js

# Monitor during load test
kubectl top pods -n opssightai
kubectl get hpa -n opssightai -w
```

### 6.2 Performance Optimization

```bash
# Enable cluster autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

# Configure cluster autoscaler
kubectl patch deployment cluster-autoscaler \
  -n kube-system \
  -p '{"spec":{"template":{"metadata":{"annotations":{"cluster-autoscaler.kubernetes.io/safe-to-evict":"false"}}}}}'

kubectl set image deployment cluster-autoscaler \
  -n kube-system \
  cluster-autoscaler=k8s.gcr.io/autoscaling/cluster-autoscaler:v1.28.0

# Add cluster name annotation
kubectl patch deployment cluster-autoscaler \
  -n kube-system \
  -p "{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"cluster-autoscaler\",\"command\":[\"./cluster-autoscaler\",\"--v=4\",\"--stderrthreshold=info\",\"--cloud-provider=aws\",\"--skip-nodes-with-local-storage=false\",\"--expander=least-waste\",\"--node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/$CLUSTER_NAME\"]}]}}}}"
```

### 6.3 Cost Optimization

```bash
# Use Spot instances for non-critical workloads
kubectl taint nodes -l lifecycle=spot spot=true:NoSchedule

# Add tolerations to deployments that can use spot instances
kubectl patch deployment opssightai-backend -n opssightai -p '
{
  "spec": {
    "template": {
      "spec": {
        "tolerations": [
          {
            "key": "spot",
            "operator": "Equal",
            "value": "true",
            "effect": "NoSchedule"
          }
        ]
      }
    }
  }
}'

# Enable RDS storage autoscaling
aws rds modify-db-instance \
  --db-instance-identifier opssightai-db \
  --max-allocated-storage 500 \
  --apply-immediately

# Review and optimize resource requests/limits
kubectl top pods -n opssightai --containers
kubectl describe vpa -n opssightai  # If VPA is installed
```

### 6.4 Disaster Recovery Testing

```bash
# Create RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier opssightai-db \
  --db-snapshot-identifier opssightai-db-snapshot-$(date +%Y%m%d)

# Test restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier opssightai-db-test \
  --db-snapshot-identifier opssightai-db-snapshot-$(date +%Y%m%d) \
  --db-instance-class db.t3.medium

# Test pod failure recovery
kubectl delete pod -n opssightai -l component=backend --force --grace-period=0

# Verify pods are recreated
kubectl get pods -n opssightai -w

# Test node failure
# Drain a node
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Verify pods are rescheduled
kubectl get pods -n opssightai -o wide

# Uncordon node
kubectl uncordon <node-name>
```


## 🚀 Phase 7: Production Cutover

### 7.1 Pre-Deployment Checklist

```bash
# Security audit
- [ ] All secrets stored in AWS Secrets Manager
- [ ] SSL/TLS certificates configured
- [ ] Network policies applied
- [ ] Pod security standards enforced
- [ ] RBAC configured
- [ ] Security groups properly configured
- [ ] IAM roles follow least privilege

# Infrastructure
- [ ] EKS cluster running and healthy
- [ ] RDS Multi-AZ enabled
- [ ] ElastiCache cluster mode enabled
- [ ] Amazon MQ active/standby configured
- [ ] Auto-scaling configured
- [ ] Backup policies in place

# Application
- [ ] All pods running and healthy
- [ ] Health checks passing
- [ ] Load balancer configured
- [ ] DNS records configured
- [ ] SSL certificate valid
- [ ] Environment variables set correctly

# Monitoring
- [ ] CloudWatch Container Insights enabled
- [ ] Prometheus and Grafana installed
- [ ] CloudWatch alarms configured
- [ ] SNS notifications configured
- [ ] Log aggregation working

# Testing
- [ ] Load testing completed
- [ ] Performance benchmarks met
- [ ] Disaster recovery tested
- [ ] Failover tested
- [ ] Backup restore tested
```

### 7.2 Deployment Script

Create `scripts/deploy-to-eks.sh`:

```bash
#!/bin/bash
set -e

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
AWS_REGION=${AWS_REGION:-us-west-2}
CLUSTER_NAME=${CLUSTER_NAME:-opssightai-prod}

echo "Deploying OpsSightAI to EKS"
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"
echo "Region: $AWS_REGION"
echo "Cluster: $CLUSTER_NAME"

# Update kubeconfig
echo "Updating kubeconfig..."
aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME

# Build and push images
echo "Building and pushing images..."
./scripts/build-and-push.sh $VERSION

# Get ECR URIs
BACKEND_ECR_URI=$(aws ecr describe-repositories --repository-names opssightai/backend --query 'repositories[0].repositoryUri' --output text)
FRONTEND_ECR_URI=$(aws ecr describe-repositories --repository-names opssightai/frontend --query 'repositories[0].repositoryUri' --output text)

# Update image tags in manifests
echo "Updating manifests..."
kubectl set image deployment/opssightai-backend \
  backend=$BACKEND_ECR_URI:$VERSION \
  -n opssightai

kubectl set image deployment/opssightai-frontend \
  frontend=$FRONTEND_ECR_URI:$VERSION \
  -n opssightai

# Wait for rollout
echo "Waiting for rollout to complete..."
kubectl rollout status deployment/opssightai-backend -n opssightai --timeout=5m
kubectl rollout status deployment/opssightai-frontend -n opssightai --timeout=5m

# Verify deployment
echo "Verifying deployment..."
kubectl get pods -n opssightai
kubectl get svc -n opssightai
kubectl get ingress -n opssightai

# Run smoke tests
echo "Running smoke tests..."
INGRESS_URL=$(kubectl get ingress opssightai-ingress -n opssightai -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test health endpoint
if curl -f -s "https://$INGRESS_URL/api/health" > /dev/null; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi

# Test assets endpoint
if curl -f -s "https://$INGRESS_URL/api/assets" > /dev/null; then
  echo "✅ Assets endpoint passed"
else
  echo "❌ Assets endpoint failed"
  exit 1
fi

echo "✅ Deployment completed successfully!"
echo "Application URL: https://$INGRESS_URL"
```

Make it executable:
```bash
chmod +x scripts/deploy-to-eks.sh
```

### 7.3 Rollback Procedure

Create `scripts/rollback.sh`:

```bash
#!/bin/bash
set -e

NAMESPACE=${1:-opssightai}
COMPONENT=${2:-all}

echo "Rolling back OpsSightAI deployment..."
echo "Namespace: $NAMESPACE"
echo "Component: $COMPONENT"

if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "backend" ]; then
  echo "Rolling back backend..."
  kubectl rollout undo deployment/opssightai-backend -n $NAMESPACE
  kubectl rollout status deployment/opssightai-backend -n $NAMESPACE
fi

if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "frontend" ]; then
  echo "Rolling back frontend..."
  kubectl rollout undo deployment/opssightai-frontend -n $NAMESPACE
  kubectl rollout status deployment/opssightai-frontend -n $NAMESPACE
fi

echo "✅ Rollback completed!"
kubectl get pods -n $NAMESPACE
```

Make it executable:
```bash
chmod +x scripts/rollback.sh
```

### 7.4 Post-Deployment Verification

```bash
# Check all resources
kubectl get all -n opssightai

# Check pod logs
kubectl logs -n opssightai -l component=backend --tail=100
kubectl logs -n opssightai -l component=frontend --tail=100

# Check events
kubectl get events -n opssightai --sort-by='.lastTimestamp'

# Test endpoints
curl -v https://opssightai.yourdomain.com/api/health
curl -v https://opssightai.yourdomain.com/api/assets

# Check metrics
kubectl top pods -n opssightai
kubectl top nodes

# Check HPA status
kubectl get hpa -n opssightai

# Check ingress
kubectl describe ingress opssightai-ingress -n opssightai

# Verify SSL certificate
openssl s_client -connect opssightai.yourdomain.com:443 -servername opssightai.yourdomain.com < /dev/null
```


## 📋 Maintenance & Operations

### Daily Operations

```bash
# Check cluster health
kubectl get nodes
kubectl get pods --all-namespaces | grep -v Running

# Check application health
kubectl get pods -n opssightai
kubectl top pods -n opssightai

# Check logs for errors
kubectl logs -n opssightai -l component=backend --tail=100 | grep -i error
kubectl logs -n opssightai -l component=frontend --tail=100 | grep -i error

# Check CloudWatch alarms
aws cloudwatch describe-alarms --state-value ALARM
```

### Weekly Operations

```bash
# Review resource usage
kubectl top nodes
kubectl top pods -n opssightai --containers

# Check for pod restarts
kubectl get pods -n opssightai -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[0].restartCount}{"\n"}{end}'

# Review HPA metrics
kubectl get hpa -n opssightai

# Check RDS performance
aws rds describe-db-instances --db-instance-identifier opssightai-db \
  --query 'DBInstances[0].[DBInstanceStatus,AllocatedStorage,StorageType]'

# Review CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=opssightai-db \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average
```

### Monthly Operations

```bash
# Update EKS cluster
eksctl upgrade cluster --name $CLUSTER_NAME --region $AWS_REGION --approve

# Update node groups
eksctl upgrade nodegroup --cluster=$CLUSTER_NAME --name=opssightai-nodes --region=$AWS_REGION

# Update add-ons
eksctl update addon --name vpc-cni --cluster $CLUSTER_NAME --region $AWS_REGION
eksctl update addon --name coredns --cluster $CLUSTER_NAME --region $AWS_REGION
eksctl update addon --name kube-proxy --cluster $CLUSTER_NAME --region $AWS_REGION

# Review and update container images
kubectl set image deployment/opssightai-backend backend=$BACKEND_ECR_URI:latest -n opssightai
kubectl set image deployment/opssightai-frontend frontend=$FRONTEND_ECR_URI:latest -n opssightai

# Review security patches
aws ecr describe-image-scan-findings --repository-name opssightai/backend --image-id imageTag=latest
aws ecr describe-image-scan-findings --repository-name opssightai/frontend --image-id imageTag=latest

# Cost analysis
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '1 month ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

### Backup and Recovery

```bash
# Manual RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier opssightai-db \
  --db-snapshot-identifier opssightai-db-manual-$(date +%Y%m%d-%H%M%S)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier opssightai-db \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime,Status]' \
  --output table

# Restore from snapshot (if needed)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier opssightai-db-restored \
  --db-snapshot-identifier opssightai-db-snapshot-YYYYMMDD \
  --db-instance-class db.t3.medium

# Backup Kubernetes resources
kubectl get all -n opssightai -o yaml > backup-$(date +%Y%m%d).yaml

# Backup secrets (encrypted)
kubectl get secrets -n opssightai -o yaml > secrets-backup-$(date +%Y%m%d).yaml
```

## 🔧 Troubleshooting

### Common Issues

#### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n opssightai

# Check events
kubectl get events -n opssightai --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n opssightai

# Check resource constraints
kubectl top nodes
kubectl describe node <node-name>
```

#### Database Connection Issues

```bash
# Test database connectivity from pod
kubectl exec -it -n opssightai deployment/opssightai-backend -- sh
# Inside pod:
nc -zv $DATABASE_HOST $DATABASE_PORT

# Check RDS status
aws rds describe-db-instances --db-instance-identifier opssightai-db

# Check security groups
aws ec2 describe-security-groups --group-ids $RDS_SG_ID
```

#### High Latency

```bash
# Check pod resources
kubectl top pods -n opssightai

# Check HPA status
kubectl get hpa -n opssightai

# Check node resources
kubectl top nodes

# Check RDS performance
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=opssightai-db \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum
```

#### SSL/TLS Issues

```bash
# Check certificate status
aws acm describe-certificate --certificate-arn $CERT_ARN

# Test SSL connection
openssl s_client -connect opssightai.yourdomain.com:443 -servername opssightai.yourdomain.com

# Check ingress annotations
kubectl describe ingress opssightai-ingress -n opssightai
```

## 💰 Cost Optimization Tips

1. **Use Spot Instances**: Save up to 90% on compute costs for non-critical workloads
2. **Right-size Resources**: Use VPA recommendations to optimize resource requests/limits
3. **Enable RDS Storage Autoscaling**: Only pay for storage you use
4. **Use Reserved Instances**: Save up to 75% for predictable workloads
5. **Enable Cluster Autoscaler**: Scale down during off-peak hours
6. **Use S3 Lifecycle Policies**: Move old backups to cheaper storage tiers
7. **Review CloudWatch Logs Retention**: Reduce retention period for non-critical logs
8. **Use AWS Savings Plans**: Commit to consistent usage for discounts

## 📚 Additional Resources

- [EKS Best Practices Guide](https://aws.github.io/aws-eks-best-practices/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Kubernetes Production Best Practices](https://kubernetes.io/docs/setup/best-practices/)
- [AWS Cost Optimization](https://aws.amazon.com/aws-cost-management/)
- [TimescaleDB on AWS](https://docs.timescale.com/timescaledb/latest/how-to-guides/install/aws/)

## 📞 Support Contacts

- **AWS Support**: https://console.aws.amazon.com/support/
- **EKS Documentation**: https://docs.aws.amazon.com/eks/
- **Kubernetes Community**: https://kubernetes.io/community/
- **OpsSightAI Team**: support@opssightai.com

---

**Implementation Timeline**: 4 weeks
**Estimated Monthly Cost**: $800-1200 (production)
**Last Updated**: February 8, 2026

