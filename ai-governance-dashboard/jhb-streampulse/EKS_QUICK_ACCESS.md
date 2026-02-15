# JHB StreamPulse - Quick Access Guide

## 🚀 Application Access

### Live URL
```
http://k8s-jhbstrea-jhbstrea-e1e5ea8a68-c77c5936cff58e7c.elb.us-east-1.amazonaws.com
```

### Quick Test
```bash
# Test application
curl http://k8s-jhbstrea-jhbstrea-e1e5ea8a68-c77c5936cff58e7c.elb.us-east-1.amazonaws.com/api/stats

# Test AI status
curl http://k8s-jhbstrea-jhbstrea-e1e5ea8a68-c77c5936cff58e7c.elb.us-east-1.amazonaws.com/api/insights/status
```

---

## 📋 Quick Commands

### View Application Status
```bash
# Get pods
kubectl get pods -n jhb-streampulse

# View logs
kubectl logs -n jhb-streampulse -l app=jhb-streampulse -f

# Get service URL
kubectl get svc jhb-streampulse -n jhb-streampulse
```

### Check Load Balancer
```bash
# View LoadBalancer details
aws elbv2 describe-load-balancers \
  --query 'LoadBalancers[?contains(DNSName, `jhbstrea`)]' \
  --output table

# Check target health
LB_ARN=$(aws elbv2 describe-load-balancers \
  --query 'LoadBalancers[?contains(DNSName, `jhbstrea`)].LoadBalancerArn' \
  --output text)
TG_ARN=$(aws elbv2 describe-target-groups \
  --load-balancer-arn $LB_ARN \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)
aws elbv2 describe-target-health --target-group-arn $TG_ARN
```

### Scale Application
```bash
# Manual scaling
kubectl scale deployment jhb-streampulse -n jhb-streampulse --replicas=3

# Check HPA status
kubectl get hpa -n jhb-streampulse
```

---

## 🔧 Configuration

### Update Admin PIN
```bash
kubectl edit configmap jhb-streampulse-config -n jhb-streampulse
# Change ADMIN_PIN value
kubectl rollout restart deployment/jhb-streampulse -n jhb-streampulse
```

### Update AI API Key
```bash
kubectl create secret generic jhb-streampulse-ai-secret \
  --from-literal=ANTHROPIC_API_KEY='your-new-key' \
  -n jhb-streampulse \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deployment/jhb-streampulse -n jhb-streampulse
```

---

## 📊 Monitoring

### Resource Usage
```bash
# Pod resource usage
kubectl top pods -n jhb-streampulse

# Node resource usage
kubectl top nodes
```

### Events
```bash
# View recent events
kubectl get events -n jhb-streampulse --sort-by='.lastTimestamp'
```

---

## 🔄 Updates

### Deploy New Version
```bash
# Build and push new image
docker build -t jhb-streampulse:v2.2.0 .
docker tag jhb-streampulse:v2.2.0 \
  713220200108.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse:v2.2.0
docker push 713220200108.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse:v2.2.0

# Update deployment
kubectl set image deployment/jhb-streampulse \
  jhb-streampulse=713220200108.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse:v2.2.0 \
  -n jhb-streampulse

# Watch rollout
kubectl rollout status deployment/jhb-streampulse -n jhb-streampulse
```

### Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/jhb-streampulse -n jhb-streampulse

# View rollout history
kubectl rollout history deployment/jhb-streampulse -n jhb-streampulse
```

---

## 💾 Backup

### Backup Database
```bash
# Get pod name
POD=$(kubectl get pods -n jhb-streampulse -l app=jhb-streampulse -o jsonpath='{.items[0].metadata.name}')

# Copy database
kubectl cp jhb-streampulse/$POD:/app/data/streampulse.db \
  ./backup-$(date +%Y%m%d-%H%M%S).db
```

### Restore Database
```bash
# Get pod name
POD=$(kubectl get pods -n jhb-streampulse -l app=jhb-streampulse -o jsonpath='{.items[0].metadata.name}')

# Copy database to pod
kubectl cp ./backup.db jhb-streampulse/$POD:/app/data/streampulse.db

# Restart pod to reload
kubectl rollout restart deployment/jhb-streampulse -n jhb-streampulse
```

---

## 🚨 Troubleshooting

### Application Not Responding
```bash
# Check pod status
kubectl get pods -n jhb-streampulse

# Check pod logs
kubectl logs -n jhb-streampulse -l app=jhb-streampulse --tail=50

# Describe pod for events
kubectl describe pod -n jhb-streampulse -l app=jhb-streampulse
```

### LoadBalancer Issues
```bash
# Check service
kubectl describe svc jhb-streampulse -n jhb-streampulse

# Check AWS Load Balancer Controller logs
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
```

### Database Issues
```bash
# Check PVC
kubectl get pvc -n jhb-streampulse

# Check volume mount
kubectl exec -it -n jhb-streampulse \
  $(kubectl get pods -n jhb-streampulse -l app=jhb-streampulse -o jsonpath='{.items[0].metadata.name}') \
  -- ls -la /app/data
```

---

## 📚 Documentation

- **Full Deployment Guide**: `EKS_DEPLOYMENT_GUIDE.md`
- **Deployment Success Report**: `DEPLOYMENT_SUCCESS.md`
- **Deployment Script**: `deploy-to-eks.sh`
- **Cluster Creation Script**: `create-eks-cluster.sh`

---

## 🔗 Useful Links

- [AWS EKS Console](https://console.aws.amazon.com/eks/home?region=us-east-1#/clusters/jhb-streampulse-cluster)
- [ECR Repository](https://console.aws.amazon.com/ecr/repositories/private/713220200108/jhb-streampulse?region=us-east-1)
- [Load Balancers](https://console.aws.amazon.com/ec2/home?region=us-east-1#LoadBalancers:)
- [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups)

---

**Cluster**: jhb-streampulse-cluster  
**Region**: us-east-1  
**Account**: 713220200108  
**Version**: v2.1.0  
**Status**: ✅ OPERATIONAL
