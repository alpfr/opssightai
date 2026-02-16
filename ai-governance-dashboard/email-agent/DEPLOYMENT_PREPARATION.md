# Email Agent Platform - Deployment Preparation Guide

## Overview

This guide walks through the steps needed to deploy the Email Agent Platform to AWS EKS. The application is production-ready and requires AWS infrastructure setup before deployment.

## Prerequisites

- AWS CLI configured with credentials for account `713220200108`
- kubectl installed and configured
- Docker installed for building images
- Access to EKS cluster: `jhb-streampulse-cluster` in `us-east-1`
- Domain name for the application (optional but recommended)

## Deployment Checklist

### 1. AWS Cognito Setup

Create a Cognito User Pool for authentication:

```bash
# Create user pool
aws cognito-idp create-user-pool \
  --pool-name email-agent-users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
  --auto-verified-attributes email \
  --username-attributes email \
  --region us-east-1

# Note the UserPoolId from output

# Create app client
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name email-agent-api \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1

# Note the ClientId from output
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Authorized redirect URIs: `https://your-domain.com/api/v1/gmail/oauth/callback`
7. Note the Client ID and Client Secret

### 3. AWS Secrets Manager Setup

Store sensitive credentials in AWS Secrets Manager:

```bash
# Create secret for database credentials
aws secretsmanager create-secret \
  --name email-agent/database \
  --description "Email Agent Database Credentials" \
  --secret-string '{"username":"emailagent","password":"CHANGE_THIS_PASSWORD"}' \
  --region us-east-1

# Create secret for JWT
aws secretsmanager create-secret \
  --name email-agent/jwt \
  --description "Email Agent JWT Secret" \
  --secret-string '{"secret":"CHANGE_THIS_TO_RANDOM_STRING"}' \
  --region us-east-1

# Create secret for Google OAuth
aws secretsmanager create-secret \
  --name email-agent/google-oauth \
  --description "Email Agent Google OAuth Credentials" \
  --secret-string '{"client_id":"YOUR_CLIENT_ID","client_secret":"YOUR_CLIENT_SECRET"}' \
  --region us-east-1
```

### 4. S3 Bucket for Attachments

Create S3 bucket with lifecycle policy:

```bash
# Create bucket
aws s3 mb s3://email-agent-attachments-713220200108 --region us-east-1

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket email-agent-attachments-713220200108 \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Add lifecycle policy for 24-hour expiration
aws s3api put-bucket-lifecycle-configuration \
  --bucket email-agent-attachments-713220200108 \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "DeleteAfter24Hours",
      "Status": "Enabled",
      "Expiration": {
        "Days": 1
      }
    }]
  }'
```

### 5. IAM Role for EKS Service Account

Create IAM role for pods to access AWS services:

```bash
# Create trust policy
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::713220200108:oidc-provider/oidc.eks.us-east-1.amazonaws.com/id/YOUR_OIDC_ID"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.us-east-1.amazonaws.com/id/YOUR_OIDC_ID:sub": "system:serviceaccount:email-agent:email-agent-sa"
        }
      }
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name email-agent-eks-role \
  --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name email-agent-eks-role \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite

aws iam attach-role-policy \
  --role-name email-agent-eks-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

### 6. PostgreSQL Database

Option A: Use RDS (Recommended for production)

```bash
aws rds create-db-instance \
  --db-instance-identifier email-agent-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username emailagent \
  --master-user-password CHANGE_THIS_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-XXXXXXXX \
  --db-subnet-group-name your-subnet-group \
  --backup-retention-period 7 \
  --storage-encrypted \
  --region us-east-1
```

Option B: Use in-cluster PostgreSQL (Development/Testing)
- The deployment script will use the postgres-deployment.yaml manifest

### 7. Redis Cache

Option A: Use ElastiCache (Recommended for production)

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id email-agent-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --security-group-ids sg-XXXXXXXX \
  --cache-subnet-group-name your-subnet-group \
  --region us-east-1
```

Option B: Use in-cluster Redis (Development/Testing)
- The deployment script will use the redis-deployment.yaml manifest

### 8. SSL Certificate (Optional but Recommended)

Request ACM certificate for your domain:

```bash
aws acm request-certificate \
  --domain-name your-domain.com \
  --subject-alternative-names *.your-domain.com \
  --validation-method DNS \
  --region us-east-1

# Follow DNS validation instructions
# Note the certificate ARN
```

Update `k8s/ingress.yaml` with certificate ARN:
```yaml
alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:713220200108:certificate/your-cert-id
```

### 9. Create Kubernetes Secret

Create `k8s/secret.yaml` with actual values:

```bash
cd email-agent
cp k8s/secret.yaml.example k8s/secret.yaml
# Edit k8s/secret.yaml with real values
```

Required values:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `COGNITO_USER_POOL_ID`: From step 1
- `COGNITO_CLIENT_ID`: From step 1
- `GOOGLE_CLIENT_ID`: From step 2
- `GOOGLE_CLIENT_SECRET`: From step 2
- `GOOGLE_REDIRECT_URI`: Your callback URL
- `ANTHROPIC_API_KEY`: Your Anthropic API key (get from https://console.anthropic.com/)
- `JWT_SECRET_KEY`: Random secure string
- `S3_BUCKET_NAME`: From step 4

### 10. Configure kubectl

```bash
aws eks update-kubeconfig \
  --region us-east-1 \
  --name jhb-streampulse-cluster
```

### 11. Run Database Migrations

Before deploying, run migrations:

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql+asyncpg://user:password@host:5432/emailagent"

# Run migrations
alembic upgrade head
```

### 12. Deploy to EKS

Run the deployment script:

```bash
cd email-agent
bash deploy-to-eks.sh
```

The script will:
1. Build Docker images for backend and frontend
2. Push images to ECR
3. Apply Kubernetes manifests
4. Wait for deployments to be ready
5. Display the application URL

### 13. Verify Deployment

```bash
# Check pods
kubectl get pods -n email-agent

# Check services
kubectl get svc -n email-agent

# Check ingress
kubectl get ingress -n email-agent

# View logs
kubectl logs -f deployment/email-agent-backend -n email-agent

# Test health endpoint
INGRESS_URL=$(kubectl get ingress email-agent-ingress -n email-agent -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$INGRESS_URL/health
```

### 14. Configure DNS (If using custom domain)

Point your domain to the ALB:

```bash
# Get ALB hostname
kubectl get ingress email-agent-ingress -n email-agent

# Create CNAME record in your DNS provider:
# your-domain.com → ALB-hostname
```

## Post-Deployment

### Create Admin User

```bash
# Use Cognito CLI or Console to create first admin user
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true \
  --temporary-password TempPassword123! \
  --region us-east-1

# Add user to Admin group (create group first if needed)
aws cognito-idp create-group \
  --user-pool-id <USER_POOL_ID> \
  --group-name Admin \
  --description "Administrator users" \
  --region us-east-1

aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username admin@example.com \
  --group-name Admin \
  --region us-east-1
```

### Monitor Application

```bash
# View logs
kubectl logs -f deployment/email-agent-backend -n email-agent

# View metrics (if Prometheus is installed)
kubectl port-forward svc/email-agent-backend 9090:9090 -n email-agent

# Check HPA status
kubectl get hpa -n email-agent
```

### Scale Application

```bash
# Manual scaling
kubectl scale deployment email-agent-backend --replicas=5 -n email-agent

# HPA will automatically scale based on CPU/memory
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n email-agent

# Check events
kubectl get events -n email-agent --sort-by='.lastTimestamp'
```

### Database connection issues

```bash
# Test database connectivity from pod
kubectl exec -it <pod-name> -n email-agent -- bash
# Inside pod:
python -c "import asyncpg; import asyncio; asyncio.run(asyncpg.connect('$DATABASE_URL'))"
```

### OAuth not working

- Verify redirect URI matches exactly in Google Console
- Check GOOGLE_REDIRECT_URI in secret matches your domain
- Ensure HTTPS is configured if using custom domain

### Images not pulling

```bash
# Check ECR authentication
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 713220200108.dkr.ecr.us-east-1.amazonaws.com

# Verify images exist
aws ecr list-images --repository-name email-agent-backend --region us-east-1
```

## Security Checklist

- [ ] Changed all default passwords
- [ ] Generated secure JWT secret
- [ ] Configured HTTPS with valid certificate
- [ ] Restricted S3 bucket access
- [ ] Enabled CloudWatch logging
- [ ] Configured backup for RDS (if using)
- [ ] Set up monitoring and alerting
- [ ] Reviewed IAM permissions (principle of least privilege)
- [ ] Enabled encryption at rest for database
- [ ] Configured network policies in Kubernetes

## Next Steps

1. Set up monitoring with CloudWatch or Prometheus
2. Configure backup and disaster recovery
3. Set up CI/CD pipeline for automated deployments
4. Load test the application
5. Create runbooks for common operations
6. Set up alerting for critical issues

## Support

For issues or questions:
- Check logs: `kubectl logs -f deployment/email-agent-backend -n email-agent`
- Review spec documents: `.kiro/specs/email-agent-platform/`
- Check GitHub repository: https://github.com/alpfr/cloudformation.git (branch: scripts-01)

---

**Last Updated**: Deployment preparation guide created
**Status**: Ready for deployment after completing AWS infrastructure setup
