# Email Agent Platform - Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment Setup

### AWS Account Configuration
- [ ] AWS CLI configured for account `713220200108`
- [ ] Access to region `us-east-1`
- [ ] kubectl configured for EKS cluster `jhb-streampulse-cluster`
- [ ] Docker installed and running

### Google Cloud Setup
- [ ] Google Cloud project created
- [ ] Gmail API enabled
- [ ] OAuth 2.0 credentials created (Web application)
- [ ] Redirect URI configured: `https://your-domain.com/api/v1/gmail/oauth/callback`
- [ ] Client ID and Client Secret saved

## AWS Infrastructure Setup

Run: `bash setup-aws-infrastructure.sh`

### Cognito User Pool
- [ ] User pool created
- [ ] App client created
- [ ] Admin group created
- [ ] User Pool ID saved: `_________________`
- [ ] Client ID saved: `_________________`

### S3 Bucket
- [ ] Bucket created: `email-agent-attachments-713220200108`
- [ ] Encryption enabled (AES256)
- [ ] Lifecycle policy configured (24-hour expiration)

### Secrets Manager
- [ ] Database credentials secret created
- [ ] JWT secret created
- [ ] Google OAuth secret created

### IAM Role
- [ ] EKS service account role created: `email-agent-eks-role`
- [ ] SecretsManagerReadWrite policy attached
- [ ] AmazonS3FullAccess policy attached

## Database Setup

### Option A: RDS (Production)
- [ ] RDS PostgreSQL instance created
- [ ] Instance identifier: `email-agent-db`
- [ ] Engine version: PostgreSQL 15.4
- [ ] Instance class: db.t3.medium
- [ ] Storage encrypted
- [ ] Backup retention: 7 days
- [ ] Endpoint saved: `_________________`

### Option B: In-Cluster PostgreSQL (Development)
- [ ] Will use postgres-deployment.yaml (no action needed)

### Database Migrations
- [ ] Backend dependencies installed: `pip install -r backend/requirements.txt`
- [ ] DATABASE_URL environment variable set
- [ ] Migrations run: `alembic upgrade head`
- [ ] Database schema verified

## Redis Setup

### Option A: ElastiCache (Production)
- [ ] ElastiCache Redis cluster created
- [ ] Cluster ID: `email-agent-redis`
- [ ] Node type: cache.t3.micro
- [ ] Endpoint saved: `_________________`

### Option B: In-Cluster Redis (Development)
- [ ] Will use redis-deployment.yaml (no action needed)

## Kubernetes Configuration

### Secret Configuration
- [ ] `k8s/secret.yaml` created from template
- [ ] DATABASE_URL configured
- [ ] REDIS_URL configured
- [ ] COGNITO_USER_POOL_ID configured
- [ ] COGNITO_CLIENT_ID configured
- [ ] GOOGLE_CLIENT_ID configured
- [ ] GOOGLE_CLIENT_SECRET configured
- [ ] GOOGLE_REDIRECT_URI configured
- [ ] ANTHROPIC_API_KEY verified (already set)
- [ ] JWT_SECRET_KEY configured
- [ ] S3_BUCKET_NAME configured

### SSL Certificate (Optional)
- [ ] ACM certificate requested
- [ ] Domain validated
- [ ] Certificate ARN saved: `_________________`
- [ ] `k8s/ingress.yaml` updated with certificate ARN

## Deployment

### Build and Push Images
- [ ] ECR repositories created (automated by script)
- [ ] Backend image built
- [ ] Backend image pushed to ECR
- [ ] Frontend image built
- [ ] Frontend image pushed to ECR

### Deploy to Kubernetes
Run: `bash deploy-to-eks.sh`

- [ ] Namespace created: `email-agent`
- [ ] ConfigMap applied
- [ ] Secret applied
- [ ] Service account created
- [ ] PostgreSQL deployed (if using in-cluster)
- [ ] Redis deployed (if using in-cluster)
- [ ] Backend deployment created
- [ ] Frontend deployment created
- [ ] Services created
- [ ] HPA configured
- [ ] Ingress created

### Verify Deployment
- [ ] All pods running: `kubectl get pods -n email-agent`
- [ ] Services accessible: `kubectl get svc -n email-agent`
- [ ] Ingress configured: `kubectl get ingress -n email-agent`
- [ ] Health check passing: `curl http://<ALB-URL>/health`
- [ ] API docs accessible: `http://<ALB-URL>/docs`

## Post-Deployment

### Create Admin User
- [ ] Admin user created in Cognito
- [ ] User added to Admin group
- [ ] Temporary password set
- [ ] Admin credentials saved securely

### DNS Configuration (If using custom domain)
- [ ] CNAME record created pointing to ALB
- [ ] DNS propagation verified
- [ ] HTTPS access working
- [ ] HTTP to HTTPS redirect working

### Application Testing
- [ ] Can access frontend
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can connect Gmail account
- [ ] OAuth flow completes successfully
- [ ] Can search emails
- [ ] Can read email details
- [ ] Can send email
- [ ] Can create draft
- [ ] Can chat with AI agent
- [ ] AI agent can perform email operations

### Monitoring Setup
- [ ] CloudWatch log groups created
- [ ] Logs flowing to CloudWatch
- [ ] Metrics endpoint accessible: `http://<ALB-URL>/metrics`
- [ ] HPA working: `kubectl get hpa -n email-agent`

### Security Verification
- [ ] All default passwords changed
- [ ] JWT secret is secure random string
- [ ] HTTPS configured (if using custom domain)
- [ ] S3 bucket access restricted
- [ ] Secrets Manager permissions verified
- [ ] Network policies reviewed

## Scaling and Performance

### Auto-Scaling Configuration
- [ ] HPA min replicas: 2
- [ ] HPA max replicas: 10
- [ ] CPU threshold: 70%
- [ ] Memory threshold: 80%
- [ ] Stabilization window: 30 seconds

### Load Testing (Optional)
- [ ] Load test performed
- [ ] Auto-scaling verified
- [ ] Performance metrics acceptable
- [ ] No errors under load

## Backup and Recovery

### Database Backups
- [ ] RDS automated backups enabled (if using RDS)
- [ ] Backup retention period: 7 days
- [ ] Point-in-time recovery enabled

### Disaster Recovery Plan
- [ ] Recovery procedures documented
- [ ] Backup restoration tested
- [ ] RTO/RPO defined

## Documentation

- [ ] Deployment notes documented
- [ ] Configuration values saved securely
- [ ] Access credentials stored in password manager
- [ ] Runbook created for common operations
- [ ] Team members trained on deployment

## Final Verification

- [ ] All checklist items completed
- [ ] Application fully functional
- [ ] Monitoring and alerting configured
- [ ] Security best practices followed
- [ ] Documentation complete
- [ ] Team ready to support production

## Deployment Information

**Deployment Date**: _______________

**Deployed By**: _______________

**Environment**: Production / Staging / Development

**Application URL**: _______________

**ALB Hostname**: _______________

**Database Endpoint**: _______________

**Redis Endpoint**: _______________

**Cognito User Pool ID**: _______________

**S3 Bucket**: _______________

## Notes

_Add any deployment-specific notes, issues encountered, or deviations from standard process:_

---

## Quick Commands Reference

```bash
# View pods
kubectl get pods -n email-agent

# View logs
kubectl logs -f deployment/email-agent-backend -n email-agent

# View services
kubectl get svc -n email-agent

# View ingress
kubectl get ingress -n email-agent

# Scale manually
kubectl scale deployment email-agent-backend --replicas=5 -n email-agent

# Check HPA
kubectl get hpa -n email-agent

# Restart deployment
kubectl rollout restart deployment/email-agent-backend -n email-agent

# View events
kubectl get events -n email-agent --sort-by='.lastTimestamp'

# Port forward for local testing
kubectl port-forward svc/email-agent-backend 8000:8000 -n email-agent

# Execute command in pod
kubectl exec -it <pod-name> -n email-agent -- bash

# View secret (base64 encoded)
kubectl get secret email-agent-secrets -n email-agent -o yaml

# Update secret
kubectl apply -f k8s/secret.yaml

# Delete and recreate deployment
kubectl delete deployment email-agent-backend -n email-agent
kubectl apply -f k8s/backend-deployment.yaml
```

---

**Status**: ☐ Not Started | ☑ Complete
**Last Updated**: _______________
