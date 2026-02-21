# OpsSightAI - AWS EKS Quick Reference

## 🚀 Quick Deployment Commands

### Prerequisites Setup
```bash
export AWS_REGION=us-west-2
export CLUSTER_NAME=opssightai-prod
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
```

### 1. Create Infrastructure (30-45 minutes)
```bash
# Create EKS cluster
eksctl create cluster -f opssightai-cluster.yaml

# Create RDS TimescaleDB
aws rds create-db-instance --db-instance-identifier opssightai-db ...

# Create ElastiCache Redis
aws elasticache create-replication-group --replication-group-id opssightai-redis ...

# Create Amazon MQ
aws mq create-broker --broker-name opssightai-mq ...
```

### 2. Build and Push Images (10 minutes)
```bash
./scripts/build-and-push.sh v1.0.0
```

### 3. Deploy Application (15 minutes)
```bash
# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller ...

# Deploy application
kubectl apply -f k8s/opssightai/

# Wait for deployment
kubectl rollout status deployment/opssightai-backend -n opssightai
kubectl rollout status deployment/opssightai-frontend -n opssightai
```

### 4. Configure DNS and SSL (10 minutes)
```bash
# Request ACM certificate
aws acm request-certificate --domain-name opssightai.yourdomain.com ...

# Create Route53 record
aws route53 change-resource-record-sets ...
```

## 📊 Monitoring Commands

```bash
# Check pod status
kubectl get pods -n opssightai

# Check resource usage
kubectl top pods -n opssightai
kubectl top nodes

# View logs
kubectl logs -f deployment/opssightai-backend -n opssightai

# Check HPA
kubectl get hpa -n opssightai

# Check ingress
kubectl get ingress -n opssightai
```

## 🔧 Common Operations

### Update Application
```bash
./scripts/deploy-to-eks.sh production v1.0.1
```

### Rollback
```bash
./scripts/rollback.sh opssightai backend
```

### Scale Manually
```bash
kubectl scale deployment opssightai-backend --replicas=5 -n opssightai
```

### Restart Pods
```bash
kubectl rollout restart deployment/opssightai-backend -n opssightai
```

## 💰 Estimated Costs

| Service | Instance Type | Monthly Cost |
|---------|--------------|--------------|
| EKS Cluster | - | $73 |
| EC2 Nodes (3x) | t3.medium | $90 |
| RDS TimescaleDB | db.t3.medium | $60 |
| ElastiCache Redis | cache.t3.micro | $15 |
| Amazon MQ | mq.t3.micro | $18 |
| ALB | - | $20 |
| Data Transfer | - | $20 |
| **Total** | | **~$296/month** |

Production (HA): ~$800-1200/month

## 🆘 Emergency Contacts

- AWS Support: https://console.aws.amazon.com/support/
- OpsSightAI Team: support@opssightai.com

## 📚 Full Documentation

See `AWS_EKS_IMPLEMENTATION_PLAN.md` for complete details.

